// ErrorPage.jsx
import { useParams } from "react-router-dom";
import ErrorLayout from "@/layouts/ErrorLayout";
import { ERROR_CONFIG } from "@/config/errorConfig";

const ErrorPage = () => {
  const { code } = useParams();
  const config = ERROR_CONFIG[Number(code)] ?? ERROR_CONFIG["default"];

  return <ErrorLayout code={code} {...config} />;
};

export default ErrorPage;
