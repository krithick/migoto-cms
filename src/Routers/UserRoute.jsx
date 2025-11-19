import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import UplaodAction from "../Components/UplaodAction/UploadAction";
import UserCourse from "../Pages/User/UserDetails/UserCourse";
import UserModule from "../Pages/User/UserDetails/UserModule";
import UserScenario from "../Pages/User/UserDetails/UserScenario";
import UserChat from "../Pages/User/UserDetails/UserChat";
import BulkListPreview from "../Components/UplaodAction/BulkListPreview/BulkListPreview";
import PageLoader from "../Components/Loader/PageLoader";

const UserManagement = React.lazy(() => import("../Pages/User/UserManagement"));
const AssignBulkCourse = React.lazy(() => import("../Pages/AssignCourse/AssignBulkCourse"));
const EditUser = React.lazy(() => import("../Pages/User/EditUser/EditUser"));

function UserRoute() {
  return (
    <>
      {/* --------------userManagement---------------- */}
      <Routes>
      <Route path="users" element={
        <Suspense fallback={<PageLoader />}>
          <UserManagement />
        </Suspense>
      } />
      <Route path="users/createUser" element={<UplaodAction />} />
      <Route path="users/createUser/bulkList" element={<BulkListPreview />} />
      {/* <Route path="users/:id" element={<CourseView />} /> */}
      <Route path="users/:id/assignCourse/:id" element={
        <Suspense fallback={<PageLoader />}>
          <AssignBulkCourse />
        </Suspense>
      } />
      <Route path="users/:id/course" element={<UserCourse />} />
      <Route path="users/:id/course/assignCourse/:id" element={
        <Suspense fallback={<PageLoader />}>
          <AssignBulkCourse />
        </Suspense>
      } />
      <Route path="users/:id/course/editUser" element={
        <Suspense fallback={<PageLoader />}>
          <EditUser />
        </Suspense>
      } />
      <Route path="users/:id/module" element={<UserModule />} />
      <Route path="users/:id/module/editUser" element={
        <Suspense fallback={<PageLoader />}>
          <EditUser />
        </Suspense>
      } />
      <Route path="users/:id/module/assignCourse/:id" element={
        <Suspense fallback={<PageLoader />}>
          <AssignBulkCourse />
        </Suspense>
      } />
      <Route path="users/:id/scenario" element={<UserScenario />} />
      <Route path="users/:id/scenario/editUser" element={
        <Suspense fallback={<PageLoader />}>
          <EditUser />
        </Suspense>
      } />
      <Route path="users/:id/scenario/assignCourse/:id" element={
        <Suspense fallback={<PageLoader />}>
          <AssignBulkCourse />
        </Suspense>
      } />
      <Route path="users/:id/chats" element={<UserChat />} />
      <Route path="users/:id/chats/editUser" element={
        <Suspense fallback={<PageLoader />}>
          <EditUser />
        </Suspense>
      } />
      </Routes>
    </>
  );
}

export default UserRoute;
