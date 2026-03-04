import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuthGuard = () => {
  // const navigate = useNavigate();
  // useEffect(() => {
  //   // 暫時 Disable guard 方便測試
  // }, []);
  return { isAuthenticated: true, user: { name: "Test User" } };
};
