/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Phone, 
  Mail, 
  Search, 
  Plus, 
  Check, 
  Globe, 
  Key, 
  AlertTriangle,
  UserCircle,
  HelpCircle,
  Clock,
  Cpu,
  Workflow,
  Zap,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export interface Contact {
  resourceName: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  role?: string;
  isCollaborating?: boolean;
}

interface ContactsManagerProps {
  onAddCollaborator: (contact: Contact, role: string) => void;
  activeProjectName: string;
  activeCollaborators: Contact[];
}

export default function ContactsManager({
  onAddCollaborator,
  activeProjectName,
  activeCollaborators
}: ContactsManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      resourceName: "people/c1",
      name: "Nguyễn Văn Hùng",
      email: "hung.nguyen@rkix.dev",
      phone: "+84 901 234 567",
      photoUrl: "",
      role: "Lead Architect",
      isCollaborating: true
    },
    {
      resourceName: "people/c2",
      name: "Trần Thị Mai",
      email: "mai.tran@rkix.dev",
      phone: "+84 912 345 678",
      photoUrl: "",
      role: "Designer Agent",
      isCollaborating: true
    },
    {
      resourceName: "people/c3",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "+1 415 555 2671",
      photoUrl: "",
      role: "Performance Auditor",
      isCollaborating: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [accessToken, setAccessToken] = useState<string>("");
  
  // Interactive Diagram Navigation replacement:
  // Instead of cryptic unorganized tabs, we select from our interactive node map:
  const [selectedNode, setSelectedNode] = useState<"core" | "google" | "team" | "invite">("core");
  
  // Create / Edit Contact Form states
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [roleInput, setRoleInput] = useState("Developer");

  // Notification Banner
  const [infoMessage, setInfoMessage] = useState<{ text: string; type: "success" | "error" | "warning" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load google access token cache if saved in memory or sessionStorage
  useEffect(() => {
    const cachedToken = sessionStorage.getItem("gcontacts_access_token");
    if (cachedToken) {
      setAccessToken(cachedToken);
      fetchGoogleContacts(cachedToken);
    }
  }, []);

  const showNotification = (text: string, type: "success" | "error" | "warning" = "success") => {
    setInfoMessage({ text, type });
    setTimeout(() => {
      setInfoMessage(null);
    }, 5000);
  };

  // FETCH CONTACTS FROM GOOGLE PEOPLE API
  const fetchGoogleContacts = async (token = accessToken) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos&pageSize=30",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Google API returned status ${response.status}. Token may be expired.`);
      }

      const data = await response.json();
      
      if (data.connections && data.connections.length > 0) {
        const parsed: Contact[] = data.connections.map((c: any) => {
          const names = c.names || [];
          const emails = c.emailAddresses || [];
          const phones = c.phoneNumbers || [];
          const photos = c.photos || [];

          return {
            resourceName: c.resourceName,
            name: names[0]?.displayName || "No Name",
            email: emails[0]?.value || "No Email",
            phone: phones[0]?.value || "No Phone",
            photoUrl: photos[0]?.url || "",
            role: "Developer",
            isCollaborating: false
          };
        });
        
        setContacts(prev => {
          const locals = prev.filter(p => !p.resourceName.startsWith("people/g"));
          return [...locals, ...parsed];
        });
        showNotification("Đã đồng bộ thành công danh bạ từ tài khoản Google Contacts!", "success");
      } else {
        showNotification("Không tìm thấy liên hệ nào trong danh bạ Google của bạn.", "warning");
      }
    } catch (err: any) {
      console.error(err);
      showNotification(`Lỗi đồng bộ Google Contacts: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // CREATE A NEW CONTACT (LOCAL / GOOGLE PEOPLE API)
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsLoading(true);
    try {
      if (accessToken) {
        const newPersonRequest = {
          names: [{ givenName: nameInput }],
          emailAddresses: [{ value: emailInput }],
          phoneNumbers: [{ value: phoneInput }]
        };

        const response = await fetch(
          "https://people.googleapis.com/v1/people:createContact",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(newPersonRequest)
          }
        );

        if (!response.ok) {
          throw new Error(`Google API failed to create: ${response.status}`);
        }

        const createdPerson = await response.json();
        const names = createdPerson.names || [];
        const emails = createdPerson.emailAddresses || [];
        const phones = createdPerson.phoneNumbers || [];

        const newContact: Contact = {
          resourceName: createdPerson.resourceName,
          name: names[0]?.displayName || nameInput,
          email: emails[0]?.value || emailInput,
          phone: phones[0]?.value || phoneInput,
          role: roleInput,
          isCollaborating: false
        };

        setContacts(prev => [newContact, ...prev]);
        showNotification("Đã lưu liên hệ mới trực tiếp vào Google Contacts liên kết!", "success");
      } else {
        const offlineId = "people/offline-" + Date.now();
        const newContact: Contact = {
          resourceName: offlineId,
          name: nameInput,
          email: emailInput,
          phone: phoneInput,
          role: roleInput,
          isCollaborating: false
        };
        setContacts(prev => [newContact, ...prev]);
        showNotification("Đã khởi tạo liên hệ cục bộ thành công! Kích hoạt Google Auth để đồng bộ đám mây.", "warning");
      }

      setNameInput("");
      setEmailInput("");
      setPhoneInput("");
      setSelectedNode("team");
    } catch (err: any) {
      showNotification(`Không thể tạo liên hệ: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // EDIT CONTACT DETAILS
  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    const isConfirmed = window.confirm(
      `Xác nhận: Bạn có muốn cập nhật thông tin của "${editingContact.name}"? Hành động này sẽ thay đổi dữ liệu đồng bộ.`
    );
    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      if (accessToken && !editingContact.resourceName.startsWith("people/offline")) {
        const getPersonRes = await fetch(
          `https://people.googleapis.com/v1/${editingContact.resourceName}?personFields=names,emailAddresses,phoneNumbers,metadata`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        if (!getPersonRes.ok) {
          throw new Error("Không thể lấy etag để cập nhật Google Contacts.");
        }

        const personData = await getPersonRes.json();
        const etag = personData.etag;

        const updateRequestBody = {
          etag: etag,
          names: [{ givenName: nameInput }],
          emailAddresses: [{ value: emailInput }],
          phoneNumbers: [{ value: phoneInput }]
        };

        const response = await fetch(
          `https://people.googleapis.com/v1/${editingContact.resourceName}:updateContact?updatePersonFields=names,emailAddresses,phoneNumbers`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(updateRequestBody)
          }
        );

        if (!response.ok) {
          throw new Error(`Google API update failed with status ${response.status}`);
        }

        showNotification("Đã cập nhật liên hệ thành công trên Google Cloud!", "success");
      } else {
        showNotification("Cập nhật liên hệ cục bộ thành công!", "success");
      }

      setContacts(prev => prev.map(c => {
        if (c.resourceName === editingContact.resourceName) {
          return {
            ...c,
            name: nameInput,
            email: emailInput,
            phone: phoneInput,
            role: roleInput
          };
        }
        return c;
      }));

      setEditingContact(null);
      setNameInput("");
      setEmailInput("");
      setPhoneInput("");
      setSelectedNode("team");
    } catch (err: any) {
      showNotification(`Lỗi cập nhật: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE A CONTACT
  const handleDeleteContact = async (contact: Contact) => {
    const isConfirmed = window.confirm(
      `CẢNH BÁO: Bạn có chắc chắn muốn xóa liên hệ "${contact.name}" không? Hành động này sẽ xóa dữ liệu vĩnh viễn.`
    );
    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      if (accessToken && !contact.resourceName.startsWith("people/offline") && !contact.resourceName.startsWith("people/c")) {
        const response = await fetch(
          `https://people.googleapis.com/v1/${contact.resourceName}:deleteContact`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        if (!response.ok) {
          throw new Error(`Google API delete failed: status ${response.status}`);
        }
        showNotification(`Đã xóa "${contact.name}" khỏi danh bạ Google vĩnh viễn!`, "success");
      } else {
        showNotification(`Đã gỡ bỏ "${contact.name}" khỏi danh sách cục bộ!`, "success");
      }

      setContacts(prev => prev.filter(c => c.resourceName !== contact.resourceName));
    } catch (err: any) {
      showNotification(`Lỗi xóa liên hệ: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // START EDITING TRIGGER
  const startEdit = (contact: Contact) => {
    setEditingContact(contact);
    setNameInput(contact.name);
    setEmailInput(contact.email);
    setPhoneInput(contact.phone);
    setRoleInput(contact.role || "Developer");
    setSelectedNode("invite");
  };

  // MANUALLY ASSIGN ACCESS TOKEN
  const handleConnectToken = (token: string) => {
    if (!token.trim()) return;
    setAccessToken(token.trim());
    sessionStorage.setItem("gcontacts_access_token", token.trim());
    fetchGoogleContacts(token.trim());
  };

  const handleDisconnect = () => {
    setAccessToken("");
    sessionStorage.removeItem("gcontacts_access_token");
    showNotification("Đã ngắt kết nối Google Contacts API. Chuyển sang ngoại tuyến.", "warning");
  };

  // COLLABORATOR DEPLOYMENT ACTION
  const hireCollaborator = (contact: Contact) => {
    const roleAssigned = prompt(`Vui lòng chỉ định vai trò cho ${contact.name} (ví dụ: Security Inspector, Senior Frontend Developer, Specialist Agent...):`, contact.role || "Developer");
    if (roleAssigned === null) return; 
    
    setContacts(prev => prev.map(c => {
      if (c.resourceName === contact.resourceName) {
        return { ...c, isCollaborating: true, role: roleAssigned };
      }
      return c;
    }));

    onAddCollaborator(contact, roleAssigned || "Developer");
    showNotification(`Đã mời và triển khai ${contact.name} làm "${roleAssigned || "Developer"}" cho dự án!`, "success");
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="contacts-management-center">
      
      {/* Visual Header Banner - Clean, futuristic, spacious */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-[#161B22] rounded-xl border border-[#30363D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-md font-bold text-white flex items-center gap-2 font-sans tracking-tight">
            <div className="w-2.5 h-2.5 rounded-full bg-[#58A6FF] shrink-0 animate-pulse"></div>
            Hệ Thống Liên Kết Nhân Sự & Google Contacts
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Phân bổ vai trò thành viên, đồng bộ danh bạ REST API và kiểm soát luồng chỉ thị thông minh.
          </p>
        </div>
        
        <div className="bg-[#0D1117] px-3.5 py-1.5 rounded-lg border border-[#30363D] flex items-center gap-2 text-[11px] font-mono select-none">
          <Clock size={12} className="text-[#58A6FF]" />
          <span className="text-gray-400">Collaborating:</span>
          <span className="text-[#3FB950] font-bold">{activeCollaborators.length} Members active</span>
        </div>
      </div>

      {infoMessage && (
        <div className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs border ${
          infoMessage.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" :
          infoMessage.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" :
          "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
        }`}>
          <AlertTriangle size={14} className="shrink-0" />
          <span>{infoMessage.text}</span>
        </div>
      )}

      {/* TWO COLUMN COCKPIT WITH DYNAMIC TOPOLOGY DIAGRAM & DETAILED INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="integration-mesh-cockpit">
        
        {/* LEFT COLUMN: INTERACTIVE ANIMATED SVG TOPOLOGY NODE MAP (7/12 width) */}
        <div className="lg:col-span-7 bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col justify-between relative min-h-[460px] overflow-hidden">
          
          <div className="z-10 bg-[#0D1117]/80 backdrop-blur border border-slate-800/80 p-3.5 rounded-lg absolute top-4 left-4 max-w-[280px]">
            <span className="text-[9px] font-mono uppercase font-bold text-[#8B949E] block mb-1">Interactive Node Map</span>
            <span className="text-[11px] text-white leading-normal font-medium">Bản đồ kết nối mô phỏng tín hiệu tích hợp hệ thống. Bấm chọn các Node để cấu hình.</span>
          </div>

          {/* REAL ANIMATED CONNECTED PIPELINE DIAGRAM */}
          <div className="flex-1 flex items-center justify-center py-6 min-h-[320px]">
            <svg viewBox="0 0 500 360" className="w-full max-w-[450px] overflow-visible">
              
              {/* ANIMATED PATHS (Flowing data stream lines) */}
              
              {/* Core to Google Link */}
              <path d="M 250,180 L 100,100" stroke="#30363D" strokeWidth="2.5" />
              <path 
                d="M 250,180 L 100,100" 
                stroke={accessToken ? "#58A6FF" : "#8B949E"} 
                strokeWidth="2" 
                strokeDasharray="8 12" 
                className="animate-[dash_20s_linear_infinite]"
              />

              {/* Core to Collaborators Team Link */}
              <path d="M 250,180 L 400,100" stroke="#30363D" strokeWidth="2.5" />
              <path 
                d="M 250,180 L 400,100" 
                stroke="#3FB950" 
                strokeWidth="2" 
                strokeDasharray="6 10" 
                className="animate-[dash_15s_linear_infinite]"
              />

              {/* Core to Recruitment Invite Form Link */}
              <path d="M 250,180 L 250,300" stroke="#30363D" strokeWidth="2.5" />
              <path 
                d="M 250,180 L 250,300" 
                stroke="#BC8CFF" 
                strokeWidth="2" 
                strokeDasharray="5 15" 
                className="animate-[dash_12s_linear_infinite]"
              />

              {/* NODE 1: CENTRAL WORKSPACE CORE (RKix Active OS Server) */}
              <g 
                className="cursor-pointer group"
                onClick={() => setSelectedNode("core")}
              >
                <circle 
                  cx="250" 
                  cy="180" 
                  r="38" 
                  fill="#0D1117" 
                  stroke={selectedNode === "core" ? "#58A6FF" : "#30363D"} 
                  strokeWidth={selectedNode === "core" ? "3.5" : "2"}
                  className="transition duration-200 group-hover:scale-105"
                />
                <circle 
                  cx="250" 
                  cy="180" 
                  r="45" 
                  fill="none" 
                  stroke="#58A6FF" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 6" 
                  className="animate-spin opacity-45"
                  style={{ transformOrigin: '250px 180px', animationDuration: "12s" }}
                />
                <Workflow className={`text-[#58A6FF] x-1` } x="238" y="168" size={24} />
                <rect x="200" y="225" width="100" height="18" rx="4" fill="#0D1117" stroke="#30363D" strokeWidth="1" />
                <text x="250" y="237" textAnchor="middle" fill="#E6EDF3" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  WORKSPACE CORE
                </text>
              </g>

              {/* NODE 2: GOOGLE API CLOUD SYNC */}
              <g 
                className="cursor-pointer group"
                onClick={() => setSelectedNode("google")}
              >
                <circle 
                  cx="100" 
                  cy="100" 
                  r="28" 
                  fill="#0D1117" 
                  stroke={selectedNode === "google" ? "#58A6FF" : accessToken ? "#3FB950" : "#30363D"} 
                  strokeWidth="2.5"
                  className="transition duration-200 group-hover:scale-105"
                />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="32" 
                  fill="transparent" 
                  stroke={accessToken ? "#3FB950" : "#D29922"} 
                  strokeWidth="1" 
                  className={accessToken ? "animate-pulse" : ""}
                />
                <Globe className={accessToken ? "text-[#3FB950]" : "text-gray-400"} x="88" y="88" size={24} />
                <rect x="50" y="135" width="100" height="18" rx="4" fill="#0D1117" stroke="#30363D" strokeWidth="1" />
                <text x="100" y="147" textAnchor="middle" fill="#8B949E" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  {accessToken ? "● GOOGLE REST" : "○ OFFLINE API"}
                </text>
              </g>

              {/* NODE 3: ACTIVE CO-DEV TEAM MATRIX */}
              <g 
                className="cursor-pointer group"
                onClick={() => setSelectedNode("team")}
              >
                <circle 
                  cx="400" 
                  cy="100" 
                  r="28" 
                  fill="#0D1117" 
                  stroke={selectedNode === "team" ? "#3FB950" : "#30363D"} 
                  strokeWidth="2.5"
                  className="transition duration-200 group-hover:scale-105"
                />
                <Users className="text-[#3FB950]" x="388" y="88" size={24} />
                <rect x="350" y="135" width="100" height="18" rx="4" fill="#0D1117" stroke="#30363D" strokeWidth="1" />
                <text x="400" y="147" textAnchor="middle" fill="#8B949E" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  MEMBERS ({contacts.length})
                </text>
              </g>

              {/* NODE 4: INVITE PORTAL FORM */}
              <g 
                className="cursor-pointer group"
                onClick={() => setSelectedNode("invite")}
              >
                <circle 
                  cx="250" 
                  cy="300" 
                  r="26" 
                  fill="#0D1117" 
                  stroke={selectedNode === "invite" ? "#BC8CFF" : "#30363D"} 
                  strokeWidth="2"
                  className="transition duration-200 group-hover:scale-105"
                />
                <UserPlus className="text-[#BC8CFF]" x="238" y="288" size={24} />
                <rect x="200" y="332" width="100" height="16" rx="4" fill="#0D1117" stroke="#30363D" strokeWidth="1" />
                <text x="250" y="343" textAnchor="middle" fill="#8B949E" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  + RECRUIT NEW
                </text>
              </g>

            </svg>
          </div>

          {/* Horizontal status quick info bar inside topology map */}
          <div className="z-10 bg-[#0D1117]/50 border-t border-slate-800/80 p-3 flex justify-between items-center text-[10px] font-mono text-gray-500 mt-2 shrink-0 rounded-lg">
            <span className="flex items-center gap-1"><Zap size={11} className="text-[#3FB950] animate-bounce" /> Status: Kernel Synced</span>
            <span className="flex items-center gap-1">Active Scope: https://www.googleapis.com/...</span>
          </div>

        </div>

        {/* RIGHT COLUMN: REENGINEERED INSPECTOR CONTEXT DRAWER / DETAILS CONTROL (5/12 width) */}
        <div className="lg:col-span-5 bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col justify-between min-h-[460px] relative">
          
          <div className="flex-1 flex flex-col min-h-0 justify-between">
            
            {/* Context Heading based on active diagram state */}
            <div className="border-b border-[#30363D] pb-3 mb-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-black/40 ${
                  selectedNode === "core" ? "text-[#58A6FF]" :
                  selectedNode === "google" ? "text-[#3FB950]" :
                  selectedNode === "team" ? "text-green-400" : "text-[#BC8CFF]"
                }`}>
                  {selectedNode === "core" && <Workflow size={14} />}
                  {selectedNode === "google" && <Globe size={14} />}
                  {selectedNode === "team" && <Users size={14} />}
                  {selectedNode === "invite" && <UserPlus size={14} />}
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                    {selectedNode === "core" && "SYS: Workspace Core"}
                    {selectedNode === "google" && "SYS: Google Contacts Sync"}
                    {selectedNode === "team" && "SYS: Active Collaborators"}
                    {selectedNode === "invite" && (editingContact ? "SYS: Edit Contact" : "SYS: Recruit Member")}
                  </h3>
                  <span className="text-[10px] text-gray-500 leading-none">
                    {selectedNode === "core" && "Kiểm soát ma trận dữ liệu dự án"}
                    {selectedNode === "google" && "Đồng bộ hóa đám mây REST RESTful"}
                    {selectedNode === "team" && "Danh sách liên hệ và thành viên active"}
                    {selectedNode === "invite" && (editingContact ? "Cập nhật dữ liệu đồng bộ" : "Tuyển thêm cộng tác viên hoặc đặc vụ")}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-black/40 text-gray-400 border border-slate-800 px-1.5 py-0.5 rounded uppercase">
                Node Inspector
              </span>
            </div>

            {/* SCREEN PANEL CONTROLS UNDER NODE */}

            {/* A. SYS WORKSPACE CORE SCREEN */}
            {selectedNode === "core" && (
              <div className="space-y-4 text-xs leading-relaxed flex-1 select-none flex flex-col justify-center">
                <p className="text-slate-300">
                  Dự án <span className="text-[#58A6FF] font-semibold">{activeProjectName}</span> được trang bị lõi điều phối container tự động. 
                  Bạn có thể ánh xạ người dùng Google Contacts thành lập trình viên thực thi mã nguồn.
                </p>

                <div className="p-3.5 bg-[#0D1117] rounded-lg border border-slate-800/80 space-y-2 text-[11px] font-mono select-none">
                  <span className="font-bold text-white block">📊 KIỂM TOÁN TÀI NGUYÊN HỆ THỐNG:</span>
                  <div className="flex justify-between border-b border-slate-800 pb-1 text-gray-400">
                    <span>Tổng số Contact đăng tải:</span>
                    <span className="text-white font-bold">{contacts.length} người</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1 text-gray-400">
                    <span>Đang hoạt động trong Team:</span>
                    <span className="text-[#3FB950] font-bold">{activeCollaborators.length} đặc vụ</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Google Cloud Connection:</span>
                    <span className={accessToken ? "text-[#3FB950] font-bold" : "text-yellow-600"}>
                      {accessToken ? "LINKED" : "OFFLINE"}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedNode("team")}
                    type="button"
                    className="w-full bg-[#1F6FEB] hover:bg-blue-600 text-white font-bold font-sans py-2.5 rounded-lg transition text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Mở rộng danh sách nhân sự
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {/* B. GOOGLE CONTACTS REST RESTFUL CONNECTIONS */}
            {selectedNode === "google" && (
              <div className="space-y-4 text-xs leading-normal flex-1">
                <p className="text-xs text-slate-300">
                  Tải thông tin từ Google People API. Tự động đồng bộ các thay đổi cục bộ lên lưu trữ đám mây.
                </p>

                {accessToken ? (
                  <div className="p-3.5 bg-green-500/5 border border-green-500/20 rounded-xl space-y-3">
                    <div className="text-[11px] font-mono text-green-400 font-bold flex items-center gap-1">
                      <ShieldCheck size={14} /> TÌNH TRẠNG: HOẠT ĐỘNG
                    </div>
                    <p className="font-mono text-[10px] break-all h-6 bg-black/40 p-1 rounded opacity-75 overflow-hidden">
                      Token: {accessToken.substring(0, 32)}...
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchGoogleContacts()}
                        className="flex-1 bg-[#3FB950] hover:bg-green-600 text-slate-900 font-bold font-sans py-2 rounded-lg transition text-[11px] cursor-pointer"
                      >
                        Đồng bộ dữ liệu ngay
                      </button>
                      <button
                        onClick={handleDisconnect}
                        className="bg-slate-800 hover:bg-slate-700/60 border border-slate-700 text-gray-400 font-bold font-sans py-2 px-3 rounded-lg transition text-[11px] cursor-pointer"
                      >
                        Ngắt
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-[#30363D] bg-[#0D1117] space-y-3">
                    <label className="block text-[11px] font-mono text-gray-400">
                      Nhập Google OAuth Access Token để khởi tạo liên kết:
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="password"
                        placeholder="Nhập ya29..."
                        id="token-inspector"
                        className="bg-[#161B22] border border-[#30363D] px-3 py-2 text-xs font-mono text-white rounded-lg focus:outline-none focus:border-[#58A6FF] flex-1 min-w-0"
                      />
                      <button
                        onClick={() => {
                          const val = (document.getElementById("token-inspector") as HTMLInputElement)?.value;
                           handleConnectToken(val);
                        }}
                        className="bg-[#58A6FF] hover:bg-blue-600 text-slate-900 font-bold px-3 py-2 rounded-lg text-xs transition cursor-pointer"
                      >
                        Kết nối
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono leading-tight block">
                      * Bạn có thể nhận Token từ popup OAuth được tích hợp trong Google Cloud Console.
                    </span>
                  </div>
                )}

                <div className="p-3 bg-black/30 border border-slate-800 rounded-lg text-[10px] font-mono text-gray-400 leading-relaxed">
                  <span className="font-bold text-white block mb-0.5">ℹ️ HƯỚNG DẪN CLOUD:</span>
                  1. Bật People API tại Google Cloud.<br/>
                  2. Cấp scope: <code className="text-[#BC8CFF] text-[9px] break-all">https://www.googleapis.com/auth/contacts</code>
                </div>
              </div>
            )}

            {/* C. ACTIVE TEAM MATRIX LIST */}
            {selectedNode === "team" && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex gap-2 bg-[#0D1117] border border-[#30363D] px-2.5 py-1.5 rounded-lg items-center text-xs mb-3 shrink-0">
                  <Search className="text-gray-500" size={13} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-white w-full font-mono text-[11px] placeholder-gray-600 focus:ring-0 py-0"
                  />
                </div>

                {filteredContacts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-[#30363D] rounded-lg">
                    Không khớp kết quả tìm kiếm.
                  </div>
                ) : (
                  <div className="overflow-y-auto pr-1 space-y-2 flex-1 max-h-[290px]">
                    {filteredContacts.map((contact, i) => {
                      const isHired = activeCollaborators.some(col => col.email === contact.email || col.resourceName === contact.resourceName);
                      return (
                        <div 
                          key={contact.resourceName + i}
                          className={`p-3 rounded-lg border bg-[#0D1117]/60 flex items-center justify-between transition-all duration-200 ${
                            isHired ? "border-[#58A6FF]/60 bg-slate-900/40" : "border-[#30363D]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-[#58A6FF] font-black text-xs shrink-0 font-mono">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="text-white text-[11px] font-bold truncate leading-tight font-sans">{contact.name}</h4>
                              <p className="text-[9px] text-[#8B949E] truncate font-mono">{contact.email}</p>
                              <span className="text-[8px] bg-[#161B22] text-[#8B949E] font-mono px-1 border border-slate-800 rounded block w-max mt-0.5 uppercase">
                                {contact.role || "Developer"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => startEdit(contact)}
                              className="p-1 hover:text-[#58A6FF] hover:bg-slate-800 text-gray-500 rounded transition"
                              title="Sửa"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact)}
                              className="p-1 hover:text-red-400 hover:bg-slate-800 text-gray-500 rounded transition mr-1"
                              title="Xóa"
                            >
                              <Trash2 size={11} />
                            </button>
                            
                            {isHired ? (
                              <span className="text-[8px] bg-green-500/10 border border-green-500/20 text-[#3FB950] font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                                <Check size={8} /> CO-DEV
                              </span>
                            ) : (
                              <button
                                onClick={() => hireCollaborator(contact)}
                                className="bg-[#1f6feb] hover:bg-blue-600 text-white font-mono text-[9px] px-2 py-1 rounded transition select-none cursor-pointer"
                              >
                                + Mời
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* D. INVITATION & DIRECT CO-DEV PORTAL INPUT FORM */}
            {selectedNode === "invite" && (
              <form onSubmit={editingContact ? handleUpdateContact : handleCreateContact} className="space-y-3.5 flex-1 select-none">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[#8B949E] mb-0.5">HỌ TÊN LIÊN HỆ *</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Nguyễn Văn A"
                      required
                      className="w-full text-xs font-mono px-3 py-1.5 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#58A6FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#8B949E] mb-0.5">VAI TRÒ LẬP TRÌNH DỰ KIẾN</label>
                    <select
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-1.5 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#58A6FF]"
                    >
                      <option value="Lead Architect">Lead Architect</option>
                      <option value="Senior Frontend Agent">Senior Frontend Agent</option>
                      <option value="React UI Artisan">React UI Artisan</option>
                      <option value="QA Auditor Agent">QA Auditor Agent</option>
                      <option value="Performance Analyst">Performance Analyst</option>
                      <option value="Developer">Developer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#8B949E] mb-0.5">ĐỊA CHỈ EMAIL *</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="dev@domain.com"
                      required
                      className="w-full text-xs font-mono px-3 py-1.5 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#58A6FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#8B949E] mb-0.5">SỐ ĐIỆN THOẠI LIÊN LẠC</label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+84 900 123 456"
                      className="w-full text-xs font-mono px-3 py-1.5 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#58A6FF]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-[11px] pt-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setSelectedNode("team"); setEditingContact(null); }}
                    className="px-3.5 py-2 border border-slate-700 hover:bg-[#161B22] text-gray-400 rounded-lg transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#3FB950] hover:bg-green-600 text-[#0D1117] font-extrabold rounded-lg transition"
                  >
                    {isLoading ? "Đang xử lý..." : editingContact ? "Sửa Google Contacts" : "Tạo và Liên Kết"}
                  </button>
                </div>
              </form>
            )}

          </div>

          <div className="mt-4 pt-3 border-t border-[#30363D] shrink-0 text-[10px] font-mono text-gray-500 leading-tight">
            💡 Gợi ý: Bấm vào <span className="text-[#3FB950] font-bold">Node Team</span> trong Sơ Đồ để quản lý đặc quyền mời thành viên hoặc cập nhật liên kết.
          </div>

        </div>

      </div>

    </div>
  );
}
