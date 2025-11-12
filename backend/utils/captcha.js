import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const verifyCaptcha = async (captchaToken) => {
    try {
        // For testing purposes - accept specific test tokens
        const testTokens = ["test-captcha", "postman-test", "development-token"];

        if (process.env.NODE_ENV === "development" && testTokens.includes(captchaToken)) {
            console.log("Using test CAPTCHA token:", captchaToken);
            return true;
        }

        if (!captchaToken) {
            throw new Error("CAPTCHA token is required");
        }

        console.log("Verifying CAPTCHA with secret key:", process.env.RECAPTCHA_SECRET_KEY?.substring(0, 10) + "...");

        const response = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: captchaToken,
                },
            }
        );

        console.log("CAPTCHA verification response:", JSON.stringify(response.data, null, 2));

        const { success, score, "error-codes": errorCodes } = response.data;

        if (!success) {
            console.error("CAPTCHA verification failed:", errorCodes);
            throw new Error(`CAPTCHA verification failed: ${errorCodes?.join(", ") || "Unknown error"}`);
        }

        // For reCAPTCHA v3, check score (optional)
        // v2 doesn't have a score, so only check if it exists
        if (score !== undefined && score < (process.env.RECAPTCHA_MIN_SCORE || 0.5)) {
            throw new Error("CAPTCHA score too low");
        }

        return true;
    } catch (error) {
        console.error("CAPTCHA verification error:", error.message);
        throw new Error(error.message || "CAPTCHA verification failed");
    }
};
