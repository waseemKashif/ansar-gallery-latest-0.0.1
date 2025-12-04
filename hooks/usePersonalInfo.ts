import { useState, useEffect, useCallback } from "react";
import { updatePersonalInfo } from "@/lib/personal-information/personal-info.api";
import { PersonalInfo } from "@/lib/user";

interface usePersonalInfoReturn {
    // State
    isLoading: boolean;
    error: string | null;
    // Actions
    updatePersonalInfo: (personalInfo: PersonalInfo) => Promise<boolean>;
    clearError: () => void;
}
