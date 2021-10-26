export const TwitterApi = jest.fn();

TwitterApi.mockImplementation(() => {
  return {
    v2: {
      userByUsername: jest.fn(),
      userTimeline: jest.fn(),
    },
  };
});
export const fakeRssFeedItemLong = {
  creator: "Max Mustermann",
  title:
    "j4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAUR",
  link: "FakeLink",
  pubDate: "FakeDate",
  content: "FakeContent",
  contentSnippet: "FakeSnippetContent",
  guid: "FakeGuid",
  isoDate: "FakeIsoDate",
};

export const fakeRssFeedItemShort = {
  creator: "Max Mustermann",
  title: "j4RkRKjmHoV3iR",
  link: "FakeLink",
  pubDate: "FakeDate",
  content: "FakeContent",
  contentSnippet: "FakeSnippetContent",
  guid: "FakeGuid",
  isoDate: "FakeIsoDate",
};

export const fakeRssFeed = [
  {
    creator: "Max Mustermann",
    title: "hallihallo",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "FakeGuid1",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "Wie teste ich Rust und Java",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "Wie-teste-ich-Rust-und-Java",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "Wie teste ich Python",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "Wie-teste-ich-Python",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "How to do something 3",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "How-to-do-something-3",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "How to do something",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "How-to-do-something",
    isoDate: "FakeIsoDate",
  },
];

export const fakeTwitterTimeline = [
  {
    id: "111111",
    text: "Wie teste ich Rust und Java",
  },
];
