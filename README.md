# Graphql fields collector

## Installation:

```shell
npm install graphql-fields-collector
```

## Why was it made?

Typically, when creating a GraphQL resolver, we need to run a query against the database and
return the data. However, sometimes the client may only require a subset of the data, which
means unnecessary fields are being retrieved and transferred, leading to slower query times.

To address this issue, this package has been developed that can improve query performance.
By reducing the number of fields retrieved from the database, the query can be processed more quickly.

## Basic Usage

To begin, let's create the collector:

```ts
import { GraphQLCollector } from "graphql-fields-collector";

type User = {
  id: string;
  name: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  author: User;
  info: {
    createdAt: Date;
  };
};

type Context = {
  select: string[];
  leftJoin: string[][];
};

const postCollector = new GraphQLCollector<Context, Post>({
  id: (ctx) => ctx.select.push("post.id"),
  title: (ctx) => ctx.select.push("post.title"),
  content: (ctx) => ctx.select.push("post.content"),
  author: (ctx) => {
    ctx.jeftJoin.push(["user", "user.id", "post.author_id"]);

    return {
      id: (ctx) => ctx.select.push("user.id as authorId"),
      name: (ctx) => ctx.select.push("user.name as authorName"),
    };
  },
  info: {
    createdAt: (ctx) => ctx.select.push("post.createdAt"),
  },
});
```

Next, we can utilize it within the GraphQL resolver:

```ts
const resolvers = {
  Query: {
    // ...
    posts(_parent, _args, _context, info: GraphQLResolveInfo): Post[] {
      const { select, leftJoin } = postCollector.collect(
        { select: [], leftJoin: [] },
        info
      );

      const query = leftJoin.reduce(
        (query, joinArgs) => query.leftJoin(...joinArgs),
        orm.select(select).from("post")
      );

      // execute query, prepare dto and return
    },
    // ...
  },
};
```

Let's take the following GraphQL query

```
query {
    posts {
        id
        title
        author {
            name
        }
    }
}
```

Than we get the following from the context:

```ts
const select = ["post.id", "post.title", "user.name"];
const leftJoin = [["user", "user.id", "post.author_id"]];
```

Context and all operations are up to you. Change it freely!

## Default tools

### - Collect

Collect works with array-like fields in context

```ts
const postCollector = new GraphQLCollector<Context, Post>({
  id: Collect("select", "post.id"),
  title: Collect("select", "post.title"),
  content: Collect("select", "post.content"),
  author: (ctx) => {
    Collect("jeftJoin", ["user", "user.id", "post.author_id"])(ctx);

    return {
      id: Collect("select", "user.id as authorId"),
      name: Collect("select", "user.name as authorName"),
    };
  },
  info: {
    createdAt: Collect("select", "post.createdAt"),
  },
});
```

Also there are few wrappers to make code readable

### - Select

Wrap Collect("select", ...selects) into Select(...selects)

```ts
const postCollector = new GraphQLCollector<Context, Post>({
  id: Select("post.id"),
  title: Select("post.title"),
  content: Select("post.content"),
  author: (ctx) => {
    Collect("jeftJoin", ["user", "user.id", "post.author_id"])(ctx);

    return {
      id: Select("user.id as authorId"),
      name: Select("user.name as authorName"),
    };
  },
  info: {
    createdAt: Select("post.createdAt"),
  },
});
```

### - LeftJoin

Wrap Collect("jeftJoin", [...leftJoinArgs]) into LeftJoin(...leftJoinArgs)

```ts
const postCollector = new GraphQLCollector<Context, Post>({
  id: Select("post.id"),
  title: Select("post.title"),
  content: Select("post.content"),
  author: (ctx) => {
    LeftJoin("user", "user.id", "post.author_id")(ctx);

    return {
      id: Select("user.id as authorId"),
      name: Select("user.name as authorName"),
    };
  },
  info: {
    createdAt: Select("post.createdAt"),
  },
});
```

### - Compose

Compose allows us to call field handlers one by one:

```ts
const postCollector = new GraphQLCollector<Context, Post>({
  id: Select("post.id"),
  title: Select("post.title"),
  content: Select("post.content"),
  author: Compose(LeftJoin("user", "user.id", "post.author_id"), () => ({
    id: Select("user.id as authorId"),
    name: Select("user.name as authorName"),
  })),
  info: {
    createdAt: Select("post.createdAt"),
  },
});
```

### - GraphQLCollectContext

In addition, if you don't require auxiliary functionality, you can simply use
the GraphQLCollectContext with the tools mentioned above.

Remember, you have the option to develop your own tools with
customized context. Here's a quick example:

```ts
type Ctx = {
  query: Knex.QueryBuilder;
};

const Select =
  (...selects: string[]) =>
  (ctx: Ctx) => {
    ctx.query = ctx.query.select(...selects);
  };
```
