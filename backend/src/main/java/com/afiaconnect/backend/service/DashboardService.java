package com.afiaconnect.backend.service;

import java.util.Map;

public interface DashboardService {
    Map<String, Object> getAdminDashboard();
    Map<String, Object> getCHWDashboard(String email);
    Map<String, Object> getDoctorDashboard(String email);
}
