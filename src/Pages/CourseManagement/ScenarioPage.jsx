import React, { useEffect, useState } from "react";
import styles from "../CourseManagement/CourseManagement.module.css";
import CourseCard from "../../Components/CourseComponent/CourseCard";
import axios from "../../service";
import { useLOIData, useUserPopupStore } from "../../store";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import CreateCourse from "../Course/CreateCourse";
import CreateModule from "../Course/CreateModule";
import { div } from "three/tsl";
import SmallBackIcon from "../../Icons/smallBackIcon";
import SearchIcon from "../../Icons/SearchIcon";
import ShowAvatarInteraction from "./AvatarInteraction/ShowAvatarInteraction";
import EditScenario from "./EditScenario/EditScenario";
import DetailCard from "./DetailCard";
import {
  clearScenarioData,
  clearSessionStorage,
  getSessionStorage,
  setSessionStorage,
} from "../../sessionHelper";

function ScenarioPage() {
  const [data, setData] = useState();
  const [datas, setDatas] = useState();
  const [courseDetail, setCourseDetail] = useState();
  let navigate = useNavigate();
  let [currentPage, setCurrentPage] = useState("showScenario");
  let [page, setPage] = useState("");
  const { selectedData, setSelectedData } = useLOIData();
  const [size, setSize] = useState("default");
  const [search, setSearch] = useState("");
  const { message, setMessage } = useUserPopupStore();

  const fetchListOfCourse = () => {
    let module_id = selectedData["showModule"]
      ? selectedData["showModule"]
      : getSessionStorage("showModule");

    Promise.all([
      axios.get(`/modules/${module_id}/scenarios`),
      axios.get(`/modules/${module_id}`),
    ])
      .then(([res, courseRes]) => {
        setData(res.data);
        setDatas(res.data);
        setCourseDetail(courseRes?.data);
        setSearch("");
      })
      .catch((err) => {
        console.log("err: ", err);
        setData([]);
        setDatas([]);
        setCourseDetail([]);
        setSearch("");
      });
  };

  const handleNextPage = () => {
    if (selectedData["showScenario"]) {
      let path = window.location.pathname.replace(
        "showScenario",
        "showAvatarInteraction"
      );
      navigate(path);
      setCurrentPage("showAvatarInteraction");
      setSessionStorage("showScenario", selectedData["showScenario"]);
    }else{
      setMessage({
        enable: true,
        msg: "Kindly Select a Scenario to Proceed ",
        state: false,
      });

    }
  };

  const handlePrevious = () => {
    if (currentPage == "showScenario") {
      setSelectedData("showModule", null);
      setCurrentPage("showModule");
      const cleanedPath = window.location.pathname?.replace(
        "/showScenario",
        "/showModule"
      );
      navigate(cleanedPath);
    }
  };

  useEffect(() => {
    if (search != "") {
      setDatas(
        datas.filter((item) =>
          item?.title?.toLowerCase()?.includes(search?.toLowerCase())
        )
      );
    } else {
      setDatas(data);
    }
  }, [search]);

  useEffect(() => {
    setData([]);
    fetchListOfCourse();
  }, [currentPage, selectedData["checkAI"]]);

  useEffect(() => {
    localStorage.setItem("flow", "CourseManagement flow");
    let path = window.location.pathname;
    if (path.endsWith("showScenario")) {
      setCurrentPage("showScenario");
    }
  }, [window.location.pathname]);

  const handleCreateBtn = () => {
    if (!courseDetail?.created_by) {
      setMessage({
        enable: true,
        msg: "Created By User is Missing",
        state: false,
      });
      return;
    }

    if (!(courseDetail?.created_by == JSON.parse(localStorage.getItem("user"))?.id)) {
      setMessage({
        enable: true,
        msg: "Only Owner can access the Course",
        state: false,
      });
      return;
    }
    localStorage.setItem("flow", "CourseManagement flow"),
    setSelectedData("courseId", getSessionStorage("showCourse"));      //corseManagement flow creating module without creating course
    setSelectedData("moduleId", getSessionStorage("showModule"));
    sessionStorage.setItem("courseId", getSessionStorage("showCourse"));
    sessionStorage.setItem("moduleId", getSessionStorage("showModule"));      //corseManagement flow creating module without creating course

    navigate("createScenario"),
      clearScenarioData(),
      setSelectedData("avatarSelection", null),
      setSelectedData("ListofAvatars", null);
  };

  return (
    <>
      <div className={styles.outerDetailHeader}>
        {currentPage == "showScenario" && (
          <div className={styles.outerDetail}>
            <div className={styles.outerDetailHead}>
              <SmallBackIcon
                onClick={() => {
                  handlePrevious();
                }}
              />
              <p>Module Details</p>
            </div>
            <hr />
            <DetailCard
              courseDetail={courseDetail}
              currentPage={currentPage}
              setCurrentPage={(item) => {
                setCurrentPage(item);
              }}
              setPage={(item) => {
                setPage(item);
              }}
            />
          </div>
        )}
        {currentPage == "showScenario" && (
          <div className={styles.OutterBox}>
            <div className={styles.header}>
              <div className={styles.headerCol}>
                <p style={{ width: "150px" }}>
                List of Scenarios
                </p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4%" }}
                >
                  <div className={styles.searchBar}>
                    <input
                      type="text"
                      placeholder={`Search Scenario`}
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                    />
                    <SearchIcon className={styles.searchIconSvg} />
                  </div>
                  <Button
                    type="primary"
                    shape="round"
                    size={size}
                    className={styles.CreteBtn}
                    onClick={() => {
                      handleCreateBtn();
                    }}
                  >
                    Create Scenario
                  </Button>
                </div>
              </div>
            </div>
            <div className={styles.list}>
              <div className={styles.listCard}>
                {datas?.map((item, index) => {
                  return (
                    <CourseCard
                      data={item}
                      key={index}
                      currentPage={currentPage}
                    />
                  );
                })}
              </div>
            </div>
            <div className={styles.footer}>
              <Button
                className={styles.cancelBtn}
                onClick={() => {
                  handlePrevious();
                }}
              >
                {"< Back"}
              </Button>
              <Button
                className={styles.primaryBtn}
                type="primary"
                onClick={() => {
                  handleNextPage();
                }}
              >
                {"Next >"}
              </Button>
            </div>
          </div>
        )}
        {/* ----------------------Edit section ----------------------------- */}
        {
          <>
            {currentPage == "editCourse" && (
              <CreateCourse
                setCurrentPage={(item) => {
                  setCurrentPage(item);
                }}
                setData={(item) => {
                  setData(item);
                }}
                courseDetail={courseDetail}
              />
            )}
            {currentPage == "editModule" && (
              <CreateModule
                setCurrentPage={(item) => {
                  setCurrentPage(item);
                }}
                setData={(item) => {
                  setData(item);
                }}
                courseDetail={courseDetail}
              />
            )}
            {currentPage == "editScenario" && (
              <EditScenario
                setCurrentPage={(item) => {
                  setCurrentPage(item);
                }}
                setData={(item) => {
                  setData(item);
                }}
                courseDetail={courseDetail}
                page={page}
              />
            )}
          </>
        }
      </div>
    </>
  );
}

export default ScenarioPage;
