import { staticRequest } from "tinacms";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { View } from '@gspenst/components'
import { useTina } from "tinacms/dist/edit-state";
import { Layout } from "../components/Layout";

const query = `{
  getPageDocument(relativePath: "home.mdx"){
    data{
      body
    }
  }
}`;

export default function Home(props) {
  // data passes though in production mode and data is updated to the sidebar data in edit-mode
  const { data } = useTina({
    query,
    variables: {},
    data: props.data,
  });

  const content = data.getPageDocument.data.body;
  return (
    <Layout>
      <View>component from @gspenst/components</View>
      <TinaMarkdown content={content} />
    </Layout>
  );
}

export const getStaticProps = async () => {
  const variables = {};
  let data = {};
  try {
    data = await staticRequest({
      query,
      variables,
    });
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      data,
      //myOtherProp: 'some-other-data',
    },
  };
};
