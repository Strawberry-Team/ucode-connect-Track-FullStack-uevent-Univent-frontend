import CompanyForm from "@/components/company/company-form";

export default async function CompanyPage({
                                              params,
                                          }: {
    params: Promise<{ company_id: string }>;
}) {
    const resolvedParams = await params;
    const companyId = parseInt(resolvedParams.company_id, 10);

    return (
        <div className="bg-background p-4 sm:p-6 md:p-8">
            <CompanyForm companyId={companyId} />
        </div>
    );
}