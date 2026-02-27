"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import SaaSTemplate from "../../../components/templates/SaaSTemplate";
import ServiceTemplate from "../../../components/templates/ServiceTemplate";
import EcommerceTemplate from "../../../components/templates/EcommerceTemplate";
import LocalBusinessTemplate from "../../../components/templates/LocalBusinessTemplate";
import CorporateTemplate from "../../../components/templates/CorporateTemplate";

const StartupPage = () => {
    const { slug } = useParams();
    const [website, setWebsite] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWebsite = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/startup/${slug}`);
                setWebsite(response.data);
            } catch (err: any) {
                console.error("Error fetching website:", err);
                setError(err.response?.data?.error || "Website not found");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchWebsite();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-xl font-medium">Launching your startup presence...</p>
                </div>
            </div>
        );
    }

    if (error || !website) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6">
                <h1 className="text-4xl font-bold mb-4">404 - Space Not Found</h1>
                <p className="text-gray-400 mb-8 max-w-md text-center">
                    The startup you're looking for hasn't landed in our swarm yet.
                    Maybe it's still in the blueprint phase?
                </p>
                <a href="/" className="px-6 py-3 bg-blue-600 rounded-full font-semibold hover:bg-blue-700 transition-colors">
                    Return to Mission Control
                </a>
            </div>
        );
    }

    const renderTemplate = () => {
        const props = { data: website.data, slug: website.slug };

        switch (website.template) {
            case "saas":
                return <SaaSTemplate {...props} />;
            case "service":
                return <ServiceTemplate {...props} />;
            case "ecommerce":
                return <EcommerceTemplate {...props} />;
            case "local":
                return <LocalBusinessTemplate {...props} />;
            case "corporate":
                return <CorporateTemplate {...props} />;
            default:
                return <SaaSTemplate {...props} />;
        }
    };

    return <div className="min-h-screen">{renderTemplate()}</div>;
};

export default StartupPage;
