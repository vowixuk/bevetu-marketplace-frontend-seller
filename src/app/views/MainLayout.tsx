import { Outlet } from "react-router-dom";
import { Nav } from "./Nav";

interface MainLayoutProps {}

const MainLayout: React.FunctionComponent<MainLayoutProps> = () => {
  //   const { idInParams, name } = useParams();
  //   const { isAuth, isLoading: authCheckingLoading } =
  //     useAuthContext() as IAuthContext;
  //   const { data: userProfile, isLoading: userProfileLoading } = useViewProfile();

  return (
    <div className="wrapper">
      <div className="content">
        <div className="nav">
          <Nav />
        </div>
        <div className="outlet">
          <Outlet />
        </div>
      </div>
    </div>
  );
};


export default MainLayout;