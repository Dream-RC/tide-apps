import LoginForm from "./LoginForm";

const LoginView = () => {
    return (
        <div className="container grid h-svh max-w-none items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8">
                <LoginForm />
            </div>
        </div>
    );
}

export default LoginView;
