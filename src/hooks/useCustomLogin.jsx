import { useSelector } from "react-redux";

const useCustomLogin = () => {
  const loginState = useSelector((state) => state.login || {});

  console.log(loginState.isLogin);
  console.log(loginState.email);
  console.log(loginState.token);

  return {
    loginState,
    isLogin: loginState.isLogin ?? false,
    email: loginState.email ?? null,
    role: loginState.role ?? null,
    token: loginState.token ?? null,
    userId: loginState.userId ?? null,
  };
};

export default useCustomLogin;
