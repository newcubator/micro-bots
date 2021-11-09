export const TwitterApi = jest.fn();

TwitterApi.mockImplementation(() => {
  return {
    v1: {
      tweet: jest.fn().mockReturnValue({ id_str: "", full_text: "" }),
    },
    v2: {
      userByUsername: jest.fn(),
      userTimeline: jest.fn(),
    },
  };
});

export const secretsExample = {
  client_email: "email@email.com",
  private_key: "privatekey123",
};

export const getRowsExample = {
  data: {
    values: [
      ["Guid", "Title"],
      ["111111", "Wie teste ich Rust und Java"],
      ["111115", "How to do something"],
    ],
  },
};

export const fakeRssFeedItemLong = {
  creator: "Max Mustermann",
  title:
    "j4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAUR",
  link: "FakeLink",
  pubDate: "FakeDate",
  content: "FakeContent",
  contentSnippet: "FakeSnippetContent",
  guid: "1234",
  isoDate: "FakeIsoDate",
};

export const fakeRssFeedItemShort = {
  creator: "Max Mustermann",
  title: "j4RkRKjmHoV3iR",
  link: "FakeLink",
  pubDate: "FakeDate",
  content: "FakeContent",
  contentSnippet: "FakeSnippetContent",
  guid: "1234",
  isoDate: "FakeIsoDate",
};

//export const emptyFeedArray = [{}];

export const fakeRssFeed = [
  {
    creator: "Max Mustermann",
    title: "Wie teste ich Rust und Java",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "111111",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "Wie teste ich Rust und Java 2",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "111112",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "Wie teste ich Python",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "111113",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "How to do something 3",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "111114",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "How to do something",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "111115",
    isoDate: "FakeIsoDate",
  },
];

export const fakeGoogleSheet = [
  {
    guid: "111111",
    title: "Wie teste ich Rust und Java",
  },
  {
    guid: "111115",
    title: "How to do something",
  },
];
