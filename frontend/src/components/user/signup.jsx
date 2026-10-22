import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import InputFieldd from "../util/InputFieldcopy";
import Spinners from "../util/Spinners";
import "../../css/login.css";
import interfac from "../../images/shop smart live better.png";
import { registerNewUser, authenticateGoogleUser } from "../actions/action";
import SocialLogin from '../util/SocialLogin';
export default function Signup() {
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
    watch,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const password = watch("password");

  const signupHandler = async (data) => {
    console.log("Signup Click", data);
    dispatch(registerNewUser(data, toast, reset, navigate, setLoader));
  };

  return (
    <div className="containeer">
      <img src={interfac} alt="Shop Smart Live Better" />
      <div className="login-container">
        <h2 className="form-title">Sign up with</h2>
              <SocialLogin
  onGoogleSuccess={handleGoogleSuccess}
  onGoogleFailure={handleGoogleFailure}
/>
        <p className="separator"><span>or</span></p>

        <form className="login-form" onSubmit={handleSubmit(signupHandler)}>
          <InputFieldd
            type="text"
            placeholder="Username"
            icon="person"
            {...register("username", { required: "Username is required" })}
          />
          {errors.username && <p className="error">{errors.username.message}</p>}

          <InputFieldd
            type="email"
            placeholder="Email address"
            icon="mail"
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email"
              }
            })}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}

          <InputFieldd
            type="password"
            placeholder="Password"
            icon="lock"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" }
            })}
          />
          {errors.password && <p className="error">{errors.password.message}</p>}

          <InputFieldd
            type="password"
            placeholder="Confirm Password"
            icon="lock"
            {...register("confirmPassword", {
              required: "Confirm Password is required",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}

          <button type="submit" className="login-button" disabled={loader}>
            {loader ? <Spinners /> : "Sign Up"}
          </button>
        </form>

        <p className="signup-prompt">
          Already have an account?{" "}
          <Link to="/login" className="signup-link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
