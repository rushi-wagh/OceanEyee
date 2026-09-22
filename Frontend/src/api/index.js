export { api } from "./axios";
export { getCurrentUser, loginUser, logoutUser, registerUser } from "./auth.api";
export {
	closeReport,
	createReport,
	getCommunityReport,
	getCommunityReports,
	getPublicHotspots,
	getCitizenReports,
	getReport,
	getReports,
	rejectReport,
	resolveReport,
	uploadReportImages,
	verifyReport,
} from "./report.api";
export { getAdminDashboard, getAuthorityDashboard, getDashboard } from "./dashboard.api";
export { getUsers, updateUserRole } from "./user.api";
