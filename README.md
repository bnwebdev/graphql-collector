# Graphql fields collector

## Installation:

```shell
npm install graphql-fields-collector
```

## Why was it made?

In general, when we make a GraphQL resolver, we have to make a query to the database and return the data. But the client may need less fields than we take from the database. It takes time to transfer data.

This package was made to improve performance.

The less we ask from database, the faster query is.

## Basic Usage

First, we should create the collector:

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
      id: (ctx) => ctx.select("user.id as authorId"),
      name: (ctx) => ctx.select("user.name as authorName"),
    };
  },
  info: {
    createdAt: (ctx) => ctx.select("post.createdAt"),
  },
});
```

Then we can use it in the graphql resolver:

```ts
const resolvers = {
  Query: {
    // ...
    posts(_parent, _args, _context, info: GraphQLResolveInfo): Post[] {
      const { select, leftJoin } = postCollector.collect({ select: [] }, info);

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

Lets take the following graphql query

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

We get the following:

```ts
const select = ["post.id", "post.title", "user.name"];
const leftJoin = [["user", "user.id", "post.author_id"]];
```

Context and all operations are up to you. Change it freely!

## Default tools

### - Collect

Collect works with array-like fields in context, you can

```ts
const postCollector = new GraphQLCollector<Context, Post>({
  id: Collect("select", "post.id"),
  title: Collect("select", "post.title"),
  content: Collect("select", "post.content"),
  author: (ctx) => {
    Collect("jeftJoin", ["user", "user.id", "post.author_id"]);

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

Wrap Compose("select", ...selects) into Select(...selects)

```ts
const postCollector = new GraphQLCollector<Context, Post>({
  id: Select("post.id"),
  title: Select("post.title"),
  content: Select("post.content"),
  author: (ctx) => {
    Collect("jeftJoin", ["user", "user.id", "post.author_id"]);

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

Wrap Compose("jeftJoin", [...leftJoinArgs]) into LeftJoin(...leftJoinArgs)

```ts
const postCollector = new GraphQLCollector<Context, Post>({
  id: Select("post.id"),
  title: Select("post.title"),
  content: Select("post.content"),
  author: (ctx) => {
    LeftJoin("user", "user.id", "post.author_id");

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

Allow us to call field handlers one by one:

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

Also, if we don't need some auxilary functionality, we can use the GraphQLCollectContext with the tools above

But keep in mind, that you have the opportunity to make own tools with own context.
Short example:

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
