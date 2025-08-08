import { Outlet } from "react-router-dom";

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
          <ul>
            <li>item 1</li>
            <li>item 2</li>
            <li>item 3</li>
          </ul>
        </div>
        <div className="outlet">
          <Outlet />
        </div>
      </div>
    </div>
  );
};


export default MainLayout;