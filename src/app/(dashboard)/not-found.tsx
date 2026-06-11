import NotFound from "@/views/NotFound";
import { getServerMode } from "@/@core/utils/serverHelpers";

const DashboardNotFound = () => {
  const mode = getServerMode();

  return <NotFound mode={mode} />;
};

export default DashboardNotFound;
