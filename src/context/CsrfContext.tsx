// "use client";
//
// import { createContext, useContext, useState, useEffect } from "react";
// import Cookies from "js-cookie";
// import { fetchCsrfToken } from "@/lib/csrf";
//
// interface CsrfContextType {
//     csrfToken: string | null;
//     refreshCsrfToken: () => Promise<void>;
// }
//
// const CsrfContext = createContext<CsrfContextType | undefined>(undefined);
//
// export function CsrfProvider({
//                                  children,
//                                  initialCsrfToken,
//                              }: {
//     children: React.ReactNode;
//     initialCsrfToken?: string | null;
// }) {
//     const [csrfToken, setCsrfToken] = useState(initialCsrfToken || Cookies.get("X-CSRF-TOKEN") || null);
//
//     const refreshCsrfToken = async () => {
//         try {
//             const newCsrfToken = await fetchCsrfToken();
//             setCsrfToken(newCsrfToken);
//         } catch (error) {
//             setCsrfToken(null);
//         }
//     };
//
//     useEffect(() => {
//         if (!csrfToken) {
//             refreshCsrfToken();
//         }
//     }, []);
//
//     return (
//         <CsrfContext.Provider value={{ csrfToken, refreshCsrfToken }}>
//             {children}
//         </CsrfContext.Provider>
//     );
// }
//
// export function useCsrf() {
//     const context = useContext(CsrfContext);
//     if (!context) {
//         throw new Error("useCsrf must be used within CsrfProvider");
//     }
//     return context;
// }