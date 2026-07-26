import { CustomResource } from "@pulumi/kubernetes/apiextensions";
import { Deployment } from "@pulumi/kubernetes/apps/v1";
import { CronJob } from "@pulumi/kubernetes/batch/v1";
import { Namespace, Secret, Service } from "@pulumi/kubernetes/core/v1";
import { Config } from "@pulumi/pulumi";

const appName = "micro-bots";
const labels = {
  "app.kubernetes.io/name": appName,
  "app.kubernetes.io/managed-by": "pulumi",
};

const config = new Config();
const namespaceName = config.require("namespace");
const domain = config.require("domain");
const imageRepository = config.require("imageRepository");
const imageTag = config.require("imageTag");
const registryUsername = config.require("gitlabRegistryUsername");
const registryPassword = config.requireSecret("gitlabRegistryPassword");
const suspendCronJobs = config.getBoolean("suspendCronJobs") ?? true;
const namespace = new Namespace("namespace", {
  metadata: { name: namespaceName, labels },
});

const applicationSecret = new Secret("application-secret", {
  metadata: { name: appName, namespace: namespace.metadata.name, labels },
  type: "Opaque",
  stringData: {
    SLACK_TOKEN: config.requireSecret("slackToken"),
    MOCO_TOKEN: config.requireSecret("mocoToken"),
    GITLAB_TOKEN: config.requireSecret("gitlabToken"),
    GENERAL_CHANNEL: config.requireSecret("generalChannel"),
    GITLAB_BOOK_PROJECT_ID: config.requireSecret("gitlabBookProjectId"),
    GITLAB_NEWCUBATOR_GROUP_ID: config.requireSecret("gitlabNewcubatorGroupId"),
  },
});

const pullSecret = new Secret("registry-secret", {
  metadata: { name: `${appName}-registry`, namespace: namespace.metadata.name, labels },
  type: "kubernetes.io/dockerconfigjson",
  stringData: {
    ".dockerconfigjson": registryPassword.apply((password) =>
      JSON.stringify({
        auths: {
          "registry.gitlab.com": {
            username: registryUsername,
            password,
            auth: Buffer.from(`${registryUsername}:${password}`, "utf8").toString("base64"),
          },
        },
      }),
    ),
  },
});

const environment = [
  "SLACK_TOKEN",
  "MOCO_TOKEN",
  "GITLAB_TOKEN",
  "GENERAL_CHANNEL",
  "GITLAB_BOOK_PROJECT_ID",
  "GITLAB_NEWCUBATOR_GROUP_ID",
].map((name) => ({
  name,
  valueFrom: { secretKeyRef: { name: applicationSecret.metadata.name, key: name } },
}));

const image = `${imageRepository}:${imageTag}`;
const podSpec = {
  imagePullSecrets: [{ name: pullSecret.metadata.name }],
  securityContext: { runAsNonRoot: true },
};

new Deployment("web", {
  metadata: { name: `${appName}-web`, namespace: namespace.metadata.name, labels },
  spec: {
    replicas: 1,
    selector: { matchLabels: labels },
    template: {
      metadata: { labels },
      spec: {
        ...podSpec,
        containers: [
          {
            name: "web",
            image,
            imagePullPolicy: "Always",
            ports: [{ name: "http", containerPort: 3000 }],
            env: [...environment, { name: "LEAD_TIME", value: "21" }],
            readinessProbe: {
              httpGet: { path: "/healthz", port: "http" },
              initialDelaySeconds: 5,
              periodSeconds: 10,
            },
            livenessProbe: {
              httpGet: { path: "/healthz", port: "http" },
              initialDelaySeconds: 10,
              periodSeconds: 10,
            },
            securityContext: { allowPrivilegeEscalation: false, capabilities: { drop: ["ALL"] } },
            resources: {
              requests: { cpu: "25m", memory: "128Mi" },
              limits: { cpu: "250m", memory: "512Mi" },
            },
          },
        ],
      },
    },
  },
});

const service = new Service("web-service", {
  metadata: { name: `${appName}-web`, namespace: namespace.metadata.name, labels },
  spec: {
    type: "ClusterIP",
    selector: labels,
    ports: [{ name: "http", port: 80, targetPort: "http" }],
  },
});

new CustomResource("ingress", {
  apiVersion: "traefik.io/v1alpha1",
  kind: "IngressRoute",
  metadata: { name: appName, namespace: namespace.metadata.name, labels },
  spec: {
    entryPoints: ["websecure"],
    routes: [{ kind: "Rule", match: `Host(\`${domain}\`)`, services: [{ name: service.metadata.name, port: 80 }] }],
    tls: { certResolver: "tls", domains: [{ main: domain }] },
  },
});

const createCronJob = (name: string, command: string) =>
  new CronJob(name, {
    metadata: { name: `${appName}-${name}`, namespace: namespace.metadata.name, labels },
    spec: {
      schedule: "5 4 * * *",
      timeZone: "Etc/UTC",
      suspend: suspendCronJobs,
      concurrencyPolicy: "Forbid",
      successfulJobsHistoryLimit: 3,
      failedJobsHistoryLimit: 3,
      jobTemplate: {
        spec: {
          backoffLimit: 1,
          template: {
            metadata: { labels },
            spec: {
              ...podSpec,
              restartPolicy: "Never",
              containers: [
                {
                  name,
                  image,
                  imagePullPolicy: "Always",
                  args: ["node", "dist/cli.js", command],
                  env: [...environment, { name: "LEAD_TIME", value: "21" }],
                  securityContext: { allowPrivilegeEscalation: false, capabilities: { drop: ["ALL"] } },
                  resources: {
                    requests: { cpu: "25m", memory: "128Mi" },
                    limits: { cpu: "250m", memory: "512Mi" },
                  },
                },
              ],
            },
          },
        },
      },
    },
  });

createCronJob("birthday", "birthday");
createCronJob("book-issue-reminder", "book-issue-reminder");
createCronJob("vacation-handover", "vacation-handover");
