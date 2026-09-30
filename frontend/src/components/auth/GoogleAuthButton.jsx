import { GoogleLogin } from "@react-oauth/google";

function GoogleAuthButton({
  onSuccess,
  onError,
  disabled = false,
}) {
  return (
    <div
      className={`w-full ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        useOneTap={false}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
}

export default GoogleAuthButton;