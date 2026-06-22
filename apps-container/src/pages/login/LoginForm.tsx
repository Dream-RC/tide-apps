import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginApi } from "@/common/api/login";
import * as authUtil from "@/common/utils/auth";
import { useSearchParams } from "react-router";
import { useRef } from "react";
import { CACHE_KEY, useCache } from "@/common/hooks/web/useCache";
import usePermissionStore from "@/store/modules/permission";

const { wsCache } = useCache("sessionStorage");

const LoginForm = () => {
    const isLoading = useRef(false);
    const [searchParams] = useSearchParams();

    const formSchema = z.object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters.")
            .max(10, "Username must be at most 10 characters.")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores.",
            ),
        password: z.string().min(1, {
            message: "Password is required.",
        }),
    });

    const form = useForm<{ username: string; password: string }>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "admin",
            password: "admin123",
        },
    });

    const onSubmit = form.handleSubmit(async () => {
        const values = form.getValues();

        try {
            const res = await LoginApi.login(values);

            if (!res) {
                return;
            }

            authUtil.setToken(res);

            const permissionInfo = await LoginApi.getInfo();
            if (permissionInfo?.routes) {
                wsCache.set(CACHE_KEY.ROLE_ROUTERS, permissionInfo.routes);
            }

            await usePermissionStore.getState().generateRoutes();

            const redirectPath = searchParams.get("redirect") || "/index";

            window.location.href = redirectPath;
        } finally {
            isLoading.current = false;
        }
    });

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                    Update your profile information below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="login-form"
                    // className={cn("flex flex-col gap-6", className)}
                    onSubmit={onSubmit}
                >
                    <FieldGroup>
                        <Controller
                            name="username"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>
                                        账号
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="请输入账号"
                                        // autoComplete="username"
                                    />
                                </Field>
                            )}
                        />

                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>
                                        密码
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="请输入密码"
                                        type="password"
                                    />
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter>
                <Field orientation="horizontal">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                    >
                        Reset
                    </Button>
                    <Button type="submit" form="login-form">
                        Save
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
};

export default LoginForm;
