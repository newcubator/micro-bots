# Build Utils

Build image used in the CI/CD process.

```
$ cd .buildutils
$ docker login registry.gitlab.com
$ docker build -f Dockerfile -t registry.gitlab.com/newcubator/newcubator/micro-bots/buildutil-node:20.19.1-alpine --push .
```
