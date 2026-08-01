const statusLabelMap = {
  SUBMITTED: "Submitted",
  PENDING_AUTHORITY: "Pending Authority",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const humanizeStatus = (status) => {
  if (!status) {
    return "Unknown";
  }

  return statusLabelMap[status] || status.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
};

export { humanizeStatus };
