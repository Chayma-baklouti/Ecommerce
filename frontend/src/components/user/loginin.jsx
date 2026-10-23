import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import SocialLogin from "../util/SocialLogin";
import InputFieldd from "../util/InputFieldcopy";
import Spinners from "../util/Spinners";
import "../../css/login.css";
import interfac from "../../images/shop smart live better.png";
import { authenticateGoogleUser } from "../actions/action"
import { authenticateSignInUser } from "../actions/action";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
const handleGoogleSuccess = async (credentialResponse) => {
  try {
    await dispatch(authenticateGoogleUser(credentialResponse, toast, navigate));
  } catch {
    toast.error("Google login failed");
  }
};

const handleGoogleFailure = () => {
  toast.error("Google login failed");
};

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const loginHandler = async (formData) => {
    try {
      await dispatch(
        authenticateSignInUser(formData, toast, reset, navigate, setLoader)
      );
    } catch (error) {
      toast.error("Login failed");
    }
  };

  return (
    // ✅ DESIGN (du 1er code)
    <div className="containeer">
      <img src={interfac} alt="Shop Smart Live Better" />

      <div className="login-container">
        <h2 className="form-title">Log in with</h2>
        <p className="separator">
       <SocialLogin
  onGoogleSuccess={handleGoogleSuccess}
  onGoogleFailure={handleGoogleFailure}
/>
          <span>or</span>
        </p>

        <form className="login-form" onSubmit={handleSubmit(loginHandler)}>
          
          {/* Username */}
          <InputFieldd
            type="text"
            placeholder="Username"
            icon="person"
            {...register("username", {
              required: "Username is required",
            })}
          />
          {errors.username && (
            <p className="error">{errors.username.message}</p>
          )}

          {/* Password */}
          <InputFieldd
            type="password"
            placeholder="Password"
            icon="lock"
            {...register("password", {
              required: "Password is required",
            })}
          />
          {errors.password && (
            <p className="error">{errors.password.message}</p>
          )}

          {/* Forgot password */}
          <Link to="/forgotpassword" className="forgot-password-link">
            Forgot password?
          </Link>

          {/* Button */}
          <button
            type="submit"
            disabled={loader}
            className="login-button"
          >
            {loader ? <Spinners /> : "Log In"}
          </button>
        </form>

        {/* Signup */}
        <p className="signup-prompt">
          Don't have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}