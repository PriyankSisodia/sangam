// src/components/Dashboard2.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrdersDashboard from './OrdersDashboard';

// ===================================================================================
// --- 1. ICON COMPONENTS ---
// A collection of reusable SVG icon components for the UI.
// ===================================================================================

const AccountIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} viewBox="0 0 32 32"><path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.546-.827-1.219-.827-1.219s-1.011-.99-1.468-1.468c-.459-.479-1.096-1.097-1.519-1.097a.63.63 0 0 0-.315.1c-.843.43-1.525.854-2.115 1.48s-1.141 1.54-1.141 2.49c0 .948 1.141 2.49 1.141 2.49s1.141 1.54 2.631 3.031c1.49 1.49 3.031 2.631 3.031 2.631s1.54 1.141 2.49 1.141c.948 0 2.49-1.141 2.49-1.141s.43-1.272.43-2.115c-.01-.843-.54-1.525-.96-1.964a.426.426 0 0 0-.215-.073z" fill="#25D366" /></svg>;
const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} viewBox="0 0 24 24"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5.52 4.5 10.02 10 10.02s10-4.5 10-10.02C22 6.53 17.5 2.04 12 2.04zM13.6 17.58h-2.9v-7.1h-1.6v-2.4h1.6V6.5c0-1.2.5-2.5 2.5-2.5h2.1v2.4h-1.5c-.4 0-.7.3-.7.7v1.5h2.2l-.3 2.4h-1.9v7.1z" fill="#1877F2" /></svg>;
const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} viewBox="0 0 24 24"><defs><radialGradient id="ig-grad" cx="0.3" cy="1.2" r="1.2"><stop offset="0" stopColor="#F58529" /><stop offset="0.5" stopColor="#DD2A7B" /><stop offset="1" stopColor="#8134AF" /></radialGradient></defs><path d="M12 2c-2.7 0-3 .01-4.06.06-1.06.05-1.79.24-2.43.5-.64.27-1.16.6-1.68 1.13-.53.52-.86 1.04-1.13 1.68-.26.64-.45 1.37-.5 2.43C2.01 9 2 9.3 2 12s.01 3 .06 4.06c.05 1.06.24 1.79.5 2.43.27.64.6 1.16 1.13 1.68.52.53 1.04.86 1.68 1.13.64.26 1.37.45 2.43.5C9 21.99 9.3 22 12 22s3-.01 4.06-.06c1.06-.05 1.79-.24 2.43-.5.64-.27 1.16-.6 1.68-1.13.53-.52-.86-1.04-1.13-1.68.26-.64.45-1.37.5-2.43.05-1.06.06-1.37.06-4.06s-.01-3-.06-4.06c-.05-1.06-.24-1.79-.5-2.43-.27-.64-.6-1.16-1.13-1.68C17.7 3.39 17.2 3.06 16.5 2.8c-.64-.26-1.37-.45-2.43-.5C13.01 2.01 12.7 2 12 2z" fill="url(#ig-grad)"/></svg>;
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const GridIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>;

// ===================================================================================
// --- 2. TYPE DEFINITIONS AND MOCK DATA ---
// Defines the data structures and provides initial placeholder data.
// ===================================================================================

type Platform = 'WhatsApp' | 'Facebook' | 'Instagram';
type ChatStatus = 'read' | 'unread';
type DateFilter = 'all' | 'today' | 'last7days';

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  platform: Platform;
  date: string; // ISO 8601 format: YYYY-MM-DD
  status: ChatStatus;
  messages: { text: string; sender: 'me' | 'them' }[];
}

const getISODate = (daysAgo: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const initialChats: Chat[] = [
  { id: 1, name: 'Alice Johnson', platform: 'WhatsApp', date: getISODate(0), status: 'unread', lastMessage: 'Is the new collection available?', messages: [{ text: 'Is the new collection available?', sender: 'them' }] },
  { id: 2, name: 'Bob Williams', platform: 'Facebook', date: getISODate(1), status: 'read', lastMessage: 'Thank you for the quick shipping!', messages: [{ text: 'Thank you!', sender: 'me' }, { text: 'Thank you for the quick shipping!', sender: 'them' }] },
  { id: 3, name: 'Charlie Brown', platform: 'Instagram', date: getISODate(2), status: 'unread', lastMessage: 'Loved the story you posted!', messages: [{ text: 'Loved the story!', sender: 'them' }] },
  { id: 4, name: 'Diana Prince', platform: 'WhatsApp', date: getISODate(0), status: 'unread', lastMessage: 'Can I change my delivery address?', messages: [{ text: 'Hi, I need help.', sender: 'them' }, { text: 'Can I change my delivery address?', sender: 'them' }] },
  { id: 5, name: 'Ethan Hunt', platform: 'Facebook', date: getISODate(8), status: 'read', lastMessage: 'Great service!', messages: [{ text: 'Great service!', sender: 'them' }] },
  { id: 6, name: 'Fiona Glenanne', platform: 'WhatsApp', date: getISODate(6), status: 'read', lastMessage: 'Okay, I will wait.', messages: [{ text: 'Okay, I will wait.', sender: 'them' }] },
];

// ===================================================================================
// --- 3. STYLING OBJECTS ---
// Centralized CSS-in-JS styles for the components.
// ===================================================================================

// --- Main application layout styles ---
const styles: { [key: string]: React.CSSProperties } = {
    wrapper: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#333',
        width: '100vw',
        padding: '20px 10px',
        boxSizing: 'border-box',
        fontFamily: 'sans-serif',
        background: 'linear-gradient(175deg, #f4f7f9 0%, #e9edf2 100%)',
        backgroundImage: `
            linear-gradient(175deg, #f4f7f9 0%, #e9edf2 100%),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><g fill-rule="evenodd"><g fill="%23d6dee5" fill-opacity="0.2"><path d="M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z"/></g></g></svg>')
        `
    },
    header: {
        width: '100%',
        maxWidth: '1600px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '0 10px',
    },
    title: {
        fontSize: '1.8rem',
        color: '#005bb5',
        fontWeight: 'bold',
    },
    accountWrapper: {
        position: 'relative',
    },
    accountIcon: {
        cursor: 'pointer',
        color: '#555',
    },
    dropdown: {
        position: 'absolute',
        top: '40px',
        right: '0',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        width: '200px',
        overflow: 'hidden',
        zIndex: 10,
    },
    dropdownItem: {
        padding: '12px 18px',
        cursor: 'pointer',
        transition: 'background 0.2s',
        borderBottom: '1px solid #f0f0f0',
    },
    dropdownHeader: {
        padding: '12px 18px',
        borderBottom: '1px solid #e0e0e0',
    },
    userEmail: {
        fontWeight: 600,
        fontSize: '0.9rem',
    },
    tabContainer: {
        width: '100%',
        maxWidth: '1600px',
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '20px',
        borderBottom: '1px solid #ddd',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        fontSize: '1rem',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        color: '#666',
        outline: 'none',
        borderBottom: '3px solid transparent',
        transition: 'color 0.3s, border-bottom-color 0.3s',
    },
    activeTab: {
        color: '#005bb5',
        borderBottom: '3px solid #005bb5',
        fontWeight: 600,
    },
    unreadBadge: {
        background: '#007bff',
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        padding: '3px 7px',
        borderRadius: '8px',
        lineHeight: 1,
    },
    content: {
        width: '100%',
        maxWidth: '1600px',
        height: 'calc(100vh - 180px)',
    }
};

// --- Styles for the Chats feature, including responsive logic ---
const chatStyles = {
  container: (isMobile: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    height: '100%',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  }),
  leftPanel: (isMobile: boolean): React.CSSProperties => ({
    width: isMobile ? '100%' : '30%',
    maxWidth: isMobile ? 'none' : '480px',
    borderRight: isMobile ? 'none' : '1px solid #e0e0e0',
    borderBottom: isMobile ? '1px solid #e0e0e0' : 'none',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  }),
  chatWindow: (isMobile: boolean): React.CSSProperties => ({
    width: isMobile ? '100%' : '70%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  }),
  chatListContainer: {
    flex: 1,
    overflowY: 'auto',
  },
  chatBox: {
    padding: '12px 15px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(to bottom, #ffffff, #f7f9fb)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  },
  activeChatBox: {
    background: 'linear-gradient(to bottom, #e8f4ff, #dce9f5)',
    transform: 'scale(1.02)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    borderRadius: '8px',
    margin: '4px 0',
  },
  chatIcon: {
    marginRight: 12,
    display: 'flex',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  chatName: {
    fontWeight: 'bold',
    fontSize: '0.95rem',
    color: '#333',
    marginBottom: '4px',
  },
  lastMessage: {
    fontSize: '0.85rem',
    color: '#777',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  unreadDot: {
    width: 8,
    height: 8,
    background: '#007bff',
    borderRadius: '50%',
    marginLeft: 10,
  },
  messages: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    background: '#f4f7f9',
  },
  message: {
    padding: '10px 15px',
    borderRadius: '18px',
    marginBottom: '10px',
    maxWidth: '70%',
    wordWrap: 'break-word',
  },
  myMessage: {
    background: 'linear-gradient(45deg, #007bff, #0056b3)',
    color: 'white',
    alignSelf: 'flex-end',
    boxShadow: '0 2px 5px rgba(0, 123, 255, 0.2)',
  },
  theirMessage: {
    background: '#e9ecef',
    color: '#333',
    alignSelf: 'flex-start',
  },
  replyInputContainer: {
    display: 'flex',
    padding: '15px',
    borderTop: '1px solid #e0e0e0',
    background: '#fff',
  },
  replyInput: {
    flex: 1,
    padding: '12px 18px',
    borderRadius: '22px',
    border: '1px solid #ccc',
    background: '#f0f0f0',
    color: '#333',
    outline: 'none',
    fontSize: '1rem',
  },
  sendButton: {
    marginLeft: '10px',
    padding: '10px 20px',
    borderRadius: '22px',
    border: 'none',
    background: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  noChatSelected: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    fontSize: '1.2rem',
    color: '#aaa',
  },
};

// --- Styles for the FilterBar sub-component ---
const filterBarStyles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    borderBottom: '1px solid #e0e0e0',
    background: '#fff',
    gap: '24px',
    flexWrap: 'wrap',
  },
  statusFilter: {
    display: 'flex',
    padding: '5px',
    background: '#e9ecef',
    borderRadius: '8px',
    flexShrink: 0,
  },
  statusButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    fontSize: '0.9rem',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#495057',
    fontWeight: 500,
    transition: 'background 0.2s, color 0.2s, transform 0.2s',
    whiteSpace: 'nowrap',
    outline: 'none',
  },
  activeStatusButton: {
    background: '#fff',
    color: '#007bff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transform: 'scale(1.03)',
  },
  unreadCountBadge: {
    background: '#007bff',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '3px 7px',
    borderRadius: '7px',
    lineHeight: 1,
  },
  filterDropdown: {
    position: 'relative',
  },
  dropdownButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#495057',
    fontWeight: 500,
    padding: '6px',
    borderRadius: '6px',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '35px',
    left: 0,
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    zIndex: 10,
    minWidth: '160px',
    overflow: 'hidden',
  },
  dropdownMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#333',
    transition: 'background 0.2s',
  },
};

// ===================================================================================
// --- 4. HELPER COMPONENTS AND HOOKS ---
// Small, reusable logic for UI elements like dropdowns and icons.
// ===================================================================================

const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return { isOpen, setIsOpen, ref };
};

const PlatformFilterIcon: React.FC<{ platform: Platform | 'all' }> = ({ platform }) => {
  const iconProps = { width: 20, height: 20 };
  switch (platform) {
    case 'WhatsApp': return <WhatsAppIcon {...iconProps} />;
    case 'Facebook': return <FacebookIcon {...iconProps} />;
    case 'Instagram': return <InstagramIcon {...iconProps} />;
    default: return <GridIcon {...iconProps} style={{ color: '#495057' }} />;
  }
};

const PlatformIcon: React.FC<{ platform: Platform }> = ({ platform }) => {
  const iconProps = { width: 20, height: 20 };
  const icon = {
    WhatsApp: <WhatsAppIcon {...iconProps} />,
    Facebook: <FacebookIcon {...iconProps} />,
    Instagram: <InstagramIcon {...iconProps} />,
  };
  return <div style={chatStyles.chatIcon}>{icon[platform]}</div>;
};

// ===================================================================================
// --- 5. SUB-COMPONENTS ---
// The main building blocks of the dashboard UI.
// ===================================================================================

// --- FilterBar Component ---
interface FilterBarProps { statusFilter: ChatStatus | 'all'; setStatusFilter: (status: ChatStatus | 'all') => void; platformFilter: Platform | 'all'; setPlatformFilter: (platform: Platform | 'all') => void; dateFilter: DateFilter; setDateFilter: (date: DateFilter) => void; unreadCount: number; }
const FilterBar: React.FC<FilterBarProps> = ({ statusFilter, setStatusFilter, platformFilter, setPlatformFilter, dateFilter, setDateFilter, unreadCount }) => {
  const platformDropdown = useDropdown();
  const dateDropdown = useDropdown();
  const platformMenuLabels: Record<Platform | 'all', string> = { all: 'All Platforms', WhatsApp: 'WhatsApp', Facebook: 'Facebook', Instagram: 'Instagram' };
  const dateLabels: Record<DateFilter, string> = { all: 'All Time', today: 'Today', 'last7days': 'Last 7 Days' };

  return (
    <div style={filterBarStyles.container}>
      <div style={filterBarStyles.statusFilter}>
        <button onClick={() => setStatusFilter('all')} style={{ ...filterBarStyles.statusButton, ...(statusFilter === 'all' ? filterBarStyles.activeStatusButton : {}) }}>All</button>
        <button onClick={() => setStatusFilter('unread')} style={{ ...filterBarStyles.statusButton, ...(statusFilter === 'unread' ? filterBarStyles.activeStatusButton : {}) }}>
          <span>Unread</span>
          {unreadCount > 0 && <span style={filterBarStyles.unreadCountBadge}>{unreadCount}</span>}
        </button>
        <button onClick={() => setStatusFilter('read')} style={{ ...filterBarStyles.statusButton, ...(statusFilter === 'read' ? filterBarStyles.activeStatusButton : {}) }}>Read</button>
      </div>

      <div style={filterBarStyles.filterDropdown} ref={platformDropdown.ref}>
        <button style={filterBarStyles.dropdownButton} onClick={() => platformDropdown.setIsOpen(!platformDropdown.isOpen)}>
          <PlatformFilterIcon platform={platformFilter} />
          <ChevronDownIcon style={{ width: 16, height: 16 }} />
        </button>
        {platformDropdown.isOpen && (
          <div style={filterBarStyles.dropdownMenu}>
            {(Object.keys(platformMenuLabels) as Array<Platform | 'all'>).map(p => (
              <div key={p} style={filterBarStyles.dropdownMenuItem} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'} onClick={() => { setPlatformFilter(p); platformDropdown.setIsOpen(false); }}>
                <PlatformFilterIcon platform={p} />
                <span>{platformMenuLabels[p]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={filterBarStyles.filterDropdown} ref={dateDropdown.ref}>
        <button style={filterBarStyles.dropdownButton} onClick={() => dateDropdown.setIsOpen(!dateDropdown.isOpen)}>
          <span>{dateLabels[dateFilter]}</span>
          <ChevronDownIcon style={{ width: 16, height: 16 }}/>
        </button>
        {dateDropdown.isOpen && (
          <div style={filterBarStyles.dropdownMenu}>
            {(Object.keys(dateLabels) as DateFilter[]).map(d => (
              <div key={d} style={filterBarStyles.dropdownMenuItem} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'} onClick={() => { setDateFilter(d); dateDropdown.setIsOpen(false); }}>
                {dateLabels[d]}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Chats Component ---
interface ChatsComponentProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  isMobile: boolean;
}
const ChatsComponent: React.FC<ChatsComponentProps> = ({ chats, setChats, isMobile }) => {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const [statusFilter, setStatusFilter] = useState<ChatStatus | 'all'>('unread');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // Filter chats based on selected criteria
  const filteredChats = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    return chats.filter(chat => {
      if (statusFilter !== 'all' && chat.status !== statusFilter) return false;
      if (platformFilter !== 'all' && chat.platform !== platformFilter) return false;
      const chatDate = new Date(chat.date);
      if (dateFilter === 'today' && chatDate.toDateString() !== today.toDateString()) return false;
      if (dateFilter === 'last7days' && chatDate < sevenDaysAgo) return false;
      return true;
    });
  }, [chats, statusFilter, platformFilter, dateFilter]);

  const unreadCount = useMemo(() => chats.filter(c => c.status === 'unread').length, [chats]);
  const activeChat = chats.find(c => c.id === activeChatId);

  // Set the first chat as active by default on desktop
  useEffect(() => {
    if (!isMobile && filteredChats.length > 0 && !activeChatId) {
      setActiveChatId(filteredChats[0].id);
    }
    if (isMobile) {
        setActiveChatId(null)
    }
  }, [isMobile, filteredChats, activeChatId]);


  const handleSendReply = () => {
    if (!replyText.trim() || !activeChatId) return;
    const newMessage = { text: replyText, sender: 'me' as const };
    const updatedChats = chats.map(chat => {
      if (chat.id === activeChatId) {
        return { ...chat, messages: [...chat.messages, newMessage], lastMessage: replyText, date: getISODate(0), status: 'read' as const };
      }
      return chat;
    });
    setChats(updatedChats);
    setReplyText('');
  };

  // On mobile, show only the chat window if a chat is selected
  if (isMobile && activeChatId) {
    return (
      <div style={chatStyles.container(isMobile)}>
        <div style={chatStyles.chatWindow(isMobile)}>
          {activeChat ? (
            <>
              {/* Back button to return to list view */}
              <button onClick={() => setActiveChatId(null)} style={{padding: '10px', border: 'none', background: '#f0f0f0', borderBottom: '1px solid #ddd'}}>← Back to Chats</button>
              <div style={chatStyles.messages}>
                {activeChat.messages.map((msg, index) => <div key={index} style={{ ...chatStyles.message, ...(msg.sender === 'me' ? chatStyles.myMessage : chatStyles.theirMessage) }}>{msg.text}</div>)}
              </div>
              <div style={chatStyles.replyInputContainer}>
                <input type="text" style={chatStyles.replyInput} placeholder="Type a message..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendReply()} />
                <button style={chatStyles.sendButton} onClick={handleSendReply}>Send</button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  // Default view for desktop, and initial view for mobile
  return (
    <div style={chatStyles.container(isMobile)}>
      <div style={chatStyles.leftPanel(isMobile)}>
        <FilterBar statusFilter={statusFilter} setStatusFilter={setStatusFilter} platformFilter={platformFilter} setPlatformFilter={setPlatformFilter} dateFilter={dateFilter} setDateFilter={setDateFilter} unreadCount={unreadCount} />
        <div style={chatStyles.chatListContainer}>
          {filteredChats.map(chat => (
            <div key={chat.id} style={{ ...chatStyles.chatBox, ...(chat.id === activeChatId ? chatStyles.activeChatBox : {}) }} onClick={() => { setActiveChatId(chat.id); if (chat.status === 'unread') { setChats(chats.map(c => (c.id === chat.id ? { ...c, status: 'read' } : c))); } }}>
              <PlatformIcon platform={chat.platform} />
              <div style={chatStyles.chatInfo}>
                <div style={chatStyles.chatName}>{chat.name}</div>
                <div style={chatStyles.lastMessage}>{chat.lastMessage}</div>
              </div>
              {chat.status === 'unread' && <div style={chatStyles.unreadDot} />}
            </div>
          ))}
        </div>
      </div>
      {!isMobile && (
        <div style={chatStyles.chatWindow(isMobile)}>
          {activeChat ? (
            <>
              <div style={chatStyles.messages}>{activeChat.messages.map((msg, index) => <div key={index} style={{ ...chatStyles.message, ...(msg.sender === 'me' ? { ...chatStyles.myMessage } : { ...chatStyles.theirMessage }) }}>{msg.text}</div>)}</div>
              <div style={chatStyles.replyInputContainer}>
                <input type="text" style={chatStyles.replyInput} placeholder="Type a message..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendReply()} />
                <button style={chatStyles.sendButton} onClick={handleSendReply}>Send</button>
              </div>
            </>
          ) : (
            <div style={chatStyles.noChatSelected}>Select a conversation to begin</div>
          )}
        </div>
      )}
    </div>
  );
};

// ===================================================================================
// --- 6. MAIN DASHBOARD COMPONENT ---
// The top-level component that assembles the entire dashboard page.
// ===================================================================================

const Dashboard2: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'chats' | 'orders' | 'graphs'>('chats');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const [chats, setChats] = useState<Chat[]>(initialChats);
    const unreadChatsCount = useMemo(() => chats.filter(c => c.status === 'unread').length, [chats]);

    // --- Responsive State Hook ---
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/login');
    };

    // --- Renders content based on the active tab ---
    const renderContent = () => {
      switch(activeTab) {
        case 'chats':
          return <ChatsComponent chats={chats} setChats={setChats} isMobile={isMobile} />;
        case 'orders':
          return <OrdersDashboard />;
//           return <div style={{textAlign: 'center', marginTop: 50}}>Orders Coming Soon</div>;
        case 'graphs':
          return <div style={{textAlign: 'center', marginTop: 50}}>Graphs Coming Soon</div>;
        default:
          return null;
      }
    };

    return (
        <div style={styles.wrapper}>
            <header style={styles.header}>
                <h1 style={styles.title}>Sangam AI</h1>
                <div style={styles.accountWrapper}>
                    <AccountIcon style={styles.accountIcon} onClick={() => setDropdownOpen(!isDropdownOpen)} />
                    {isDropdownOpen && (
                        <div style={styles.dropdown}>
                            <div style={styles.dropdownHeader}><div style={styles.userEmail}>user@example.com</div></div>
                            <div style={styles.dropdownItem} onClick={handleLogout} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>Logout</div>
                        </div>
                    )}
                </div>
            </header>

            <nav style={styles.tabContainer}>
                <button style={{ ...styles.tab, ...(activeTab === 'chats' ? styles.activeTab : {}) }} onClick={() => setActiveTab('chats')}>
                    <span>Chats</span>
                    {unreadChatsCount > 0 && <span style={styles.unreadBadge}>{unreadChatsCount}</span>}
                </button>
                <button style={{ ...styles.tab, ...(activeTab === 'orders' ? styles.activeTab : {}) }} onClick={() => setActiveTab('orders')}>Orders</button>
                <button style={{ ...styles.tab, ...(activeTab === 'graphs' ? styles.activeTab : {}) }} onClick={() => setActiveTab('graphs')}>Graphs</button>
            </nav>

            <main style={styles.content}>
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard2;
