export { api } from "./axios";
export { getCurrentUser, loginUser, logoutUser, registerUser } from "./auth.api";
export {
	closeReport,
	createReport,
	getCitizenReports,
	getReport,
	getReports,
	rejectReport,
	resolveReport,
	uploadReportImages,
	verifyReport,
} from "./report.api";
export { getAuthorityDashboard, getDashboard } from "./dashboard.api";
