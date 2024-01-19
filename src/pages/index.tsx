
import Layout from "~/components/General/Layout";
import Welcome from "~/views/WelcomeView";
import Search from "~/views/SearchView";
import Affiliation from "~/views/AffiliationView";

const Home = () => {
  return (
    <Layout>
      <Welcome></Welcome>
      <Search></Search>
      <Affiliation></Affiliation>
    </Layout>
  );
};

export default Home;
