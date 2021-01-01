import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "apollo-boost";
import gql from "graphql-tag";
import { getAccessToken, isLoggedIn } from "./auth";

const endpointURL = "http://localhost:9000/graphql";

// Prepare authLink with headers & access token
const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    operation.setContext({
      headers: {
        "authorization": `Bearer ${getAccessToken()}`
      }
    });
  }
  return forward(operation);
});

// Pass authLink before HttpLink request
const client = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    new HttpLink({
      uri: endpointURL
    })
  ]),
  cache: new InMemoryCache()
});

// FRAGMENTS

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    title
    company {
      id
      name
    }
    description
  }
`;

// QUERIES & MUTATIONS

const companyQuery = gql`
  query CompanyQuery($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        title
      }
    }
  }
`;
const jobQuery = gql`
  query JobQuery($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;
const jobsQuery = gql`
  query JobsQuery {
    jobs {
      id
      title
      company {
        id
        name
      }
      description
    }
  }
`;
const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput) {
    job: createJob(
      input: $input
    ) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

// REQUESTS

export async function loadJob(id) {
  const variables = {
    id
  };

  const {data: {job}} = await client.query({
    query: jobQuery,
    variables
  });

  return job;
}

export async function loadJobs() {
  const {data: {jobs}} = await client.query({
    query: jobsQuery,
    fetchPolicy: "no-cache"
  });

  return jobs;
}

export async function createJob(input) {
  const variables = {
    input
  };

  const {data: {job}} = await client.mutate({
    mutation: createJobMutation,
    variables,
    update: (cache, {data}) => {
      cache.writeQuery({
        query: jobQuery,
        variables: {
          id: data.job.id
        },
        data
      });
    }
  });

  return job;
}

export async function loadCompany(id) {
  const variables = {
    id
  };

  const {data: {company}} = await client.query({
    query: companyQuery,
    variables
  });

  return company;
}
