"use client";

import PageContainer from "@/components/pageContainer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
    orderId: z.string().min(1, { message: "Order ID is required" }),
    billingLastName: z.string().min(1, { message: "Billing Last Name is required" }),
    findOrderBy: z.enum(["email", "zip"]),
    email: z.string().email({ message: "Invalid email address" }).optional(),
    zip: z.string().min(1, { message: "Zip Code is required" }).optional(),
}).refine((data) => {
    if (data.findOrderBy === "email" && !data.email) {
        return false;
    }
    if (data.findOrderBy === "zip" && !data.zip) {
        return false;
    }
    return true;
}, {
    message: "This field is required",
    path: ["email"],
});

const OrderAndReturns = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            orderId: "",
            billingLastName: "",
            findOrderBy: "email",
            email: "",
            zip: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        console.log("Form Values:", values);
    };

    const findOrderBy = form.watch("findOrderBy");

    return (
        <PageContainer className="py-10 flex justify-center">
            <Card className="w-full max-w-2xl lg:shadow-md lg:border-gray-200 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="text-2xl font-medium text-center text-gray-800">Order Information</CardTitle>
                </CardHeader>
                <CardContent className="lg:p-6 p-2 ">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="orderId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-semibold">Order ID <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter Order ID" {...field} className="h-10 border-gray-300 transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="billingLastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-semibold">Billing Last Name <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter Last Name" {...field} className="h-10 border-gray-300  transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="findOrderBy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-semibold">Find Order By <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 border-gray-300 ">
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="email">Email Address</SelectItem>
                                                <SelectItem value="zip">Zip Code</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {findOrderBy === "email" ? (
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-semibold">Email Address <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="Enter Email Address" {...field} className="h-10 border-gray-300  transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="zip"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-semibold">Zip Code <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter Zip Code" {...field} className="h-10 border-gray-300  transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    className=" text-white font-bold py-2 px-8 rounded capitalize shadow-md transition-all duration-200 hover:shadow-lg w-full lg:w-auto"
                                >
                                    Continue
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default OrderAndReturns;