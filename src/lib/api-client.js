import axios from "axios"


class ApiClient {
    constructor() {
        this.api = axios.create({
            baseURL: "/api",
        })
    }

    async registerUser(fullName, email, password) {
        try {
            const response = await this.api.post("/user/register", {
                fullName, email, password
            })
            console.log("response: ", response)
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }

    async verifyOTP(email, otp) {
        try {
            const response = await this.api.post("/user/verify-otp", {
                email, otp
            })

            return response
        } catch (error) {
            this.handleError(error)
        }
    }

    async resendOTP(email) {
        try {
            const response = await this.api.post("/user/resend-otp", { email })
            return response
        } catch (error) {
            throw error
        }
    }

    async updateProfile(passwordChange) {
        try {
            const response = await this.api.post("/user/change-password", { passwordChange })
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }

    async analyzeResume(userEmail, formData, isFormData = false) {
        try {
            const headers = isFormData ? { "Content-Type": "multipart/form-data" } : { 'Content-Type': 'application/json' };
            const response = await this.api.post(`/analyze-resume?email=${encodeURIComponent(userEmail)}`, formData, { headers })
            return response.data;
        } catch (error) {
            this.handleError(error)
        }
    }

    async CareerRecommendation(formData) {
        const response = await this.api.post("/recommend-career", { formData })

        return response.data
    }

    async skillGap(formData, isFormData = false) {
        try {
            const headers = isFormData ? { "Content-Type": "multipart/form-data" } : { 'Content-Type': 'application/json' };
            const response = await this.api.post("/skill-gap", formData, { headers })
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }

    async personalityPrediction(answers, name) {
        try {
            const response = await this.api.post("/personality-prediction", { answers, name })
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }

    async createMockInterview(formData, userEmail) {
        try {
            const response = await this.api.post("/mock-interview", { ...formData, userEmail })
            return response
        } catch (error) {
            this.handleError(error)
        }
    }

    async getMockInterviewDetails(userEmail) {
        try {
            const response = await this.api.get(`mock-interview?email=${encodeURIComponent(userEmail)}`)
            return response
        } catch (error) {
            this.handleError(error)
        }
    }

    async getMockInterview(id) {
        try {
            const response = await this.api.get(`/getInterviewById?Id=${id}`)
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }


    async allUsers() {
        try {
            const response = await this.api.get("/admin/user")
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }

    async deleteUsers(email) {
        try {
            const response = await this.api.delete(`admin/user?email=${email}`)
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }

    async allMockInterview() {
        try {
            const response = await this.api.get("/getAll-mock-interview")
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }

    async allOTPS() {
        try {
            const response = await this.api.get("/admin/otp")
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }

    async deleteOTP(email) {
        try {
            const response = await this.api.delete(`/admin/otp?email=${email}`)
            return response
        } catch (error) {
            this.handleError(error)
        }
    }

    async allRecommendations() {
        try {
            const response = await this.api.get("/recommend-career")
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }

    async allSkillGaps() {
        try {
            const response = await this.api.get("/skill-gap")
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }

    handleError(error) {
        // Preserve the original error so callers can inspect response details
        // This allows UI components to extract specific error messages (e.g., incorrect current password)
        throw error;
    }

}

export const apiClient = new ApiClient()
