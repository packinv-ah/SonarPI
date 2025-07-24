let API = process.env.REACT_APP_API_KEY;

export const endpoints = {
  getCustomers: `${API}/packcustomers/allcustomers`,
  sendAttachmentMails: `${API}/mailer/sendDirectMail`,

  getUserRoles: `${API}/packuser/getuserroles`,
  addUserRoles: `${API}/packuser/adduserroles`,

  delUserRoles: `${API}/packuser/deluserroles`,

  getUserMenus: `${API}/packuser/getusermenus`,
  getUsers: `${API}/packuser/getusers`,
  addUserMenus: `${API}/packuser/addusermenus`,
  delUserMenus: `${API}/packuser/delusermenus`,
  getUnits: `${API}/packunits/allunits`,
  saveUsers: `${API}/packuser/saveusers`,
  delUsers: `${API}/packuser/delusers`,

  saveMenuRoleMapping: `${API}/packuser/savemenurolemapping`,
  getRoleMenus: `${API}/packuser/getrolemenus`,
};
