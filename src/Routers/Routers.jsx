import React, { useEffect, Suspense } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import BulkListPreview from "../Components/UplaodAction/BulkListPreview/BulkListPreview";
import { UpdateTimeline } from "../Components/Timeline/UpdateTImeLine";
import { useLOIData, usePreviewStore } from "../store";
import { getSessionStorage } from "../sessionHelper";
import NotFound from "../Utils/NotFound/NotFound";
import PageLoader from "../Components/Loader/PageLoader";

const Dashboard = React.lazy(()=> import("../Pages/Dashboard/Dashboard"))
const DashboardRoute = React.lazy(()=> import("./DashboardRoute"))
const CourseRoute = React.lazy(()=> import("./CourseRoute"))
const UserRoute = React.lazy(()=> import("./UserRoute"))
const AdminRoute = React.lazy(()=> import("./AdminRoute"))

function Routers() {
  const { setSelectedData } = useLOIData();
  const { setIsPreview } = usePreviewStore();
  let path = window.location.pathname;
  
  useEffect(() => {
    if (path.endsWith("editContent")) {
      console.log("path1: ", path);
      UpdateTimeline(
        3,
        {
          status: "warning",
          description: `In Progress`,
        },
        setSelectedData
      );
      UpdateTimeline(
        4,
        {
          status: "error",
          description: `In Progress`,
        },
        setSelectedData
      );
      UpdateTimeline(
        5,
        {
          status: "error",
          description: `In Progress`,
        },
        setSelectedData
      );
      UpdateTimeline(
        6,
        {
          status: "error",
          description: `In Progress`,
        },
        setSelectedData
      );
      UpdateTimeline(
        7,
        {
          status: "error",
          description: `In Progress`,
        },
        setSelectedData
      );
    }
    if (path.endsWith("videoPdf")) {
      console.log("path2: ", path);
      UpdateTimeline(
        3,
        {
          status: "success",
          description: `Yet to complete`,
        },
        setSelectedData
      );
      UpdateTimeline(
        4,
        {
          status: "warning",
          description: `In Progress`,
        },
        setSelectedData
      );
      UpdateTimeline(
        5,
        {
          status: "error",
          description: `In Progress`,
        },
        setSelectedData
      );
      UpdateTimeline(
        6,
        {
          status: "error",
          description: `In Progress`,
        },
        setSelectedData
      );
      UpdateTimeline(
        7,
        {
          status: "error",
          description: `In Progress`,
        },
        setSelectedData
      );
    }
    if (path.endsWith("personaCreation")) {
      console.log("path3: ", path);
      UpdateTimeline(
        4,
        {
          status: "success",
          description: ``,
        },
        setSelectedData
      );
      UpdateTimeline(
        5,
        {
          status: "warning",
          description: `In Progress`,
        },
        setSelectedData
      );
      UpdateTimeline(
        6,
        {
          status: "error",
          description: `In Progress`,
        },
        setSelectedData
      );
      UpdateTimeline(
        7,
        {
          status: "error",
          description: `In Progress`,
        },
        setSelectedData
      );
    }
    if (path.endsWith("createAvatar")) {
      UpdateTimeline(
        5,
        {
          status: "success",
          description: getSessionStorage(""),
        },
        setSelectedData
      );
      UpdateTimeline(
        6,
        {
          status: "warning",
          description: `In Progress`,
        },
        setSelectedData
      );
      UpdateTimeline(
        7,
        {
          status: "error",
          description: `In Progress`,
        },
        setSelectedData
      );
    }
    if (path.endsWith("Assign")) {
      UpdateTimeline(
        6,
        {
          status: "success",
          description: ``,
        },
        setSelectedData
      );
      UpdateTimeline(
        7,
        {
          status: "warning",
          description: `In Progress`,
        },
        setSelectedData
      );
    }
  }, [window.location.pathname]);
  return (
    <>
      {/* <Suspense fallback={<PageLoader />}> */}
        <DashboardRoute />
        <CourseRoute />
        <UserRoute />
        <AdminRoute />
      <Routes>
        <Route path="dashboard" element={
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        } />
        {/* <Route path="avatarManagement" element={<AvatarManagement />} /> */}
        <Route path="bulkList" element={<BulkListPreview />} />
        <Route path="use" element={<PageLoader />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
      {/* </Suspense> */}
    </>
  );
}

export default Routers;
