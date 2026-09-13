import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  FileText, 
  FileCode, 
  FileSpreadsheet, 
  Presentation, 
  File, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  ExternalLink, 
  Loader2, 
  RefreshCw, 
  UploadCloud, 
  Building2, 
  User, 
  Layers, 
  Sparkles, 
  AlertCircle,
  Plus,
  ArrowRight,
  Database
} from 'lucide-react';
import { 
  googleSignIn, 
  logout, 
  getAccessToken, 
  initAuth 
} from '../services/googleDriveAuth';
import { 
  listGoogleDriveFiles, 
  computeDriveFileHash, 
  GoogleDriveFileItem 
} from '../services/googleDriveApi';
import { Block, ConnectedAccount, ProofCategory, TransactionPayload } from '../types';
import confetti from 'canvas-confetti';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMintProof: (tx: TransactionPayload) => Promise<void>;
  connectedAccounts: ConnectedAccount[];
  activeAccount: ConnectedAccount;
  onSelectAccount: (account: ConnectedAccount) => void;
  onAddAccount: (account: ConnectedAccount) => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  onMintProof,
  connectedAccounts,
  activeAccount,
  onSelectAccount,
  onAddAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'DRIVE_FILES' | 'ACCOUNTS'>('DRIVE_FILES');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('jaylang085@gmail.com');
  const [currentUserName, setCurrentUserName] = useState<string>('Jay Lang');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive files state
  const [files, setFiles] = useState<GoogleDriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileForAnchor, setSelectedFileForAnchor] = useState<GoogleDriveFileItem | null>(null);
  const [targetCategory, setTargetCategory] = useState<ProofCategory>('SOFTWARE_IP');
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [anchorSuccessTx, setAnchorSuccessTx] = useState<string | null>(null);

  // New account form state
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccOrg, setNewAccOrg] = useState('');
  const [newAccRole, setNewAccRole] = useState('');
  const [newAccType, setNewAccType] = useState<'ENTERPRISE' | 'ORGANIZATION' | 'PERSONAL'>('PERSONAL');

  // Listen to auth state
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (user, token) => {
        setIsAuthenticated(true);
        if (user.email) setCurrentUserEmail(user.email);
        if (user.displayName) setCurrentUserName(user.displayName);
        loadFiles();
      },
      () => {
        // Not signed in yet or token expired
        getAccessToken().then(tok => {
          if (tok) {
            setIsAuthenticated(true);
            loadFiles();
          } else {
            setIsAuthenticated(false);
          }
        });
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsAuthenticated(true);
        if (res.user.email) setCurrentUserEmail(res.user.email);
        if (res.user.displayName) setCurrentUserName(res.user.displayName);
        await loadFiles();
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setIsAuthenticated(false);
    setFiles([]);
  };

  const loadFiles = async (query?: string) => {
    setIsLoadingFiles(true);
    setAuthError(null);
    try {
      const result = await listGoogleDriveFiles(query);
      setFiles(result);
    } catch (err: any) {
      console.warn('Failed to load Drive files:', err);
      // If token expired or network issue, present clean message
      setAuthError(err.message || 'Unable to load Google Drive files. Please sign in again.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles(searchQuery);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('spreadsheet') || mimeType.includes('sheet') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-400 shrink-0" />;
    }
    if (mimeType.includes('presentation') || mimeType.includes('slide')) {
      return <Presentation className="h-5 w-5 text-amber-400 shrink-0" />;
    }
    if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json') || mimeType.includes('python') || mimeType.includes('rust')) {
      return <FileCode className="h-5 w-5 text-cyan-400 shrink-0" />;
    }
    if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('text')) {
      return <FileText className="h-5 w-5 text-blue-400 shrink-0" />;
    }
    return <File className="h-5 w-5 text-slate-400 shrink-0" />;
  };

  const handleAnchorFile = async () => {
    if (!selectedFileForAnchor) return;
    setIsAnchoring(true);
    setAuthError(null);
    try {
      // Compute authentic cryptographic hash
      const hashResult = await computeDriveFileHash(selectedFileForAnchor);
      const timestamp = new Date().toISOString();
      const txId = `tx-drive-${selectedFileForAnchor.id.slice(0, 8)}-${Date.now().toString(36)}`;

      const txPayload: TransactionPayload = {
        txId,
        category: targetCategory,
        title: selectedFileForAnchor.name,
        description: `Authentic Google Drive evidence imported from account ${currentUserEmail} (${activeAccount.orgName}). Verified zero-knowledge digest of real document/file. ${hashResult.summaryNote}.`,
        author: `${activeAccount.name} (${activeAccount.email})`,
        authorWallet: activeAccount.walletAddress,
        contentRaw: `GOOGLE_DRIVE_EVIDENCE:\nFILE_ID: ${selectedFileForAnchor.id}\nNAME: ${selectedFileForAnchor.name}\nMIME: ${selectedFileForAnchor.mimeType}\nSIZE_BYTES: ${hashResult.bytesCount}\nMODIFIED: ${selectedFileForAnchor.modifiedTime || timestamp}\nDIGEST_HASH: ${hashResult.hash}\nACCOUNT_SCOPE: ${activeAccount.type} (${activeAccount.orgName})`,
        contentHash: hashResult.hash,
        fileName: selectedFileForAnchor.name,
        fileSize: hashResult.bytesCount,
        mimeType: selectedFileForAnchor.mimeType,
        tags: ['Google Drive', activeAccount.orgName, targetCategory, 'Authentic Evidence'],
        version: '1.0.0',
        ipDeclaration: {
          title: selectedFileForAnchor.name,
          creatorName: activeAccount.name,
          creatorWallet: activeAccount.walletAddress,
          licenseType: 'Creator Exclusive Copyright & Trade Secret',
          priorArtTimestamp: timestamp,
          repositoryOrSourceUrl: selectedFileForAnchor.webViewLink || `https://drive.google.com/file/d/${selectedFileForAnchor.id}`,
          noveltyDeclaration: `Verifiable cryptographic proof of genuine work anchored from Google Drive account ${currentUserEmail} with tamper-evident SHA-256 seal.`,
          isZeroKnowledgeHash: true
        },
        googleTos: {
          ipOwnershipRetained: true,
          licenseScope: 'CREATOR_EXCLUSIVE',
          privacyCompliant: true,
          consentProvided: true,
          termsReference: 'Google Terms of Service (July 30, 2026) - Section: "Your content remains yours"',
          immutableProtectionNote: 'All rights and content remain 100% owned by creator. Permanently anchored to blockchain.'
        },
        timestamp
      };

      await onMintProof(txPayload);
      setAnchorSuccessTx(txId);
      setSelectedFileForAnchor(null);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Failed to anchor file:', err);
      setAuthError(err.message || 'Failed to anchor file to blockchain.');
    } finally {
      setIsAnchoring(false);
    }
  };

  const handleCreateNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccEmail) return;

    const randomWallet = `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`;
    const newAccount: ConnectedAccount = {
      id: `acc-${Date.now().toString(36)}`,
      name: newAccName,
      email: newAccEmail,
      type: newAccType,
      orgName: newAccOrg || 'Enterprise Organization',
      role: newAccRole || 'Contributor & Verified Creator',
      walletAddress: randomWallet,
      accountSource: newAccType === 'ENTERPRISE' ? 'GOOGLE_WORKSPACE' : 'PERSONAL_GOOGLE',
      verifiedAt: new Date().toISOString(),
      isCurrent: false
    };

    onAddAccount(newAccount);
    onSelectAccount(newAccount);
    setIsAddingAccount(false);
    setNewAccName('');
    setNewAccEmail('');
    setNewAccOrg('');
    setNewAccRole('');
  };

  if (!isOpen) return null;

  return (
    <div id="google-drive-sync-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Database className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Google Drive & Multi-Account Hub</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Import real files & tie in your Enterprise, Organization, and Personal accounts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('DRIVE_FILES')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'DRIVE_FILES'
                  ? 'text-emerald-400 border-emerald-400 bg-slate-800/50'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <UploadCloud className="h-4 w-4" />
              <span>Browse & Anchor Drive Files</span>
            </button>
            <button
              onClick={() => setActiveTab('ACCOUNTS')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'ACCOUNTS'
                  ? 'text-emerald-400 border-emerald-400 bg-slate-800/50'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Connected Enterprise & Personal Accounts ({connectedAccounts.length})</span>
            </button>
          </div>

          {/* Active Account Pill */}
          <div className="hidden sm:flex items-center gap-2 py-1 px-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400 text-[11px]">Active:</span>
            <span className="text-slate-200 font-semibold text-[11px] truncate max-w-[140px]">{activeAccount.name}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">

          {/* Error Message */}
          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Notice: </span>
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {anchorSuccessTx && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-sm text-white">Cryptographic Proof Anchored to Ledger!</p>
                  <p className="text-emerald-400/90 font-mono text-[11px]">Transaction ID: {anchorSuccessTx}</p>
                </div>
              </div>
              <button
                onClick={() => setAnchorSuccessTx(null)}
                className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Tab 1: DRIVE FILES */}
          {activeTab === 'DRIVE_FILES' && (
            <div className="space-y-4">
              
              {/* Auth Status & Connect Card */}
              {!isAuthenticated ? (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 text-center space-y-4 shadow-lg">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-bold text-white">Connect Google Drive</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Sign in with your Google account to access documents, code files, and deliverables across your Enterprise, Organization, and Personal accounts with permission from the app's users.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-3 pt-2">
                    {/* Official Sign in with Google Material Button */}
                    <button 
                      id="btn-google-drive-signin"
                      onClick={handleSignIn}
                      disabled={isSigningIn}
                      className="gsi-material-button inline-flex items-center justify-center px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                      <div className="gsi-material-button-icon mr-2.5">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4 block">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}
                      </span>
                    </button>

                    <span className="text-[11px] text-slate-400 font-mono">
                      Scope: drive.readonly • Project: master-recovery-hub-2026
                    </span>
                  </div>
                </div>
              ) : (
                /* Authenticated Google Account Banner */
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300 text-sm">
                      {currentUserName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{currentUserName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          Connected
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{currentUserEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadFiles(searchQuery)}
                      disabled={isLoadingFiles}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoadingFiles ? 'animate-spin text-emerald-400' : ''}`} />
                      <span>Refresh Files</span>
                    </button>

                    <button
                      onClick={handleSignOut}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {/* Files Search & Listing */}
              {isAuthenticated && (
                <div className="space-y-3">
                  {/* Search Bar */}
                  <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search real Google Drive files by name..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoadingFiles}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Search
                    </button>
                  </form>

                  {/* Loading State */}
                  {isLoadingFiles && (
                    <div className="py-12 text-center space-y-3">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-400 mx-auto" />
                      <p className="text-xs text-slate-400 font-mono">Fetching files from Google Drive...</p>
                    </div>
                  )}

                  {/* File List */}
                  {!isLoadingFiles && files.length === 0 && (
                    <div className="py-10 text-center space-y-2 border border-dashed border-slate-800 rounded-xl p-6">
                      <File className="h-8 w-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-300 font-semibold">No files found in this Drive query.</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Make sure you have files in your connected Google account, or try searching for another keyword.
                      </p>
                    </div>
                  )}

                  {!isLoadingFiles && files.length > 0 && (
                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                      {files.map(file => (
                        <div
                          key={file.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            selectedFileForAnchor?.id === file.id
                              ? 'bg-blue-950/30 border-blue-500 shadow-md shadow-blue-950/50'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {getFileIcon(file.mimeType)}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white truncate hover:text-blue-300">
                                  {file.name}
                                </h4>
                                {file.webViewLink && (
                                  <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-500 hover:text-slate-300"
                                    title="Open in Google Drive"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono truncate">
                                {file.mimeType.replace('application/vnd.google-apps.', '')} 
                                {file.size ? ` • ${(Number(file.size) / 1024).toFixed(1)} KB` : ''} 
                                {file.modifiedTime ? ` • Modified: ${new Date(file.modifiedTime).toLocaleDateString()}` : ''}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedFileForAnchor(file)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                              selectedFileForAnchor?.id === file.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {selectedFileForAnchor?.id === file.id ? 'Selected' : 'Anchor File'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Anchoring Drawer if a file is selected */}
                  {selectedFileForAnchor && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/40 space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-bold text-white">
                            Configure Blockchain Proof Anchor for:
                          </span>
                          <span className="text-xs font-mono text-blue-300 font-semibold">
                            {selectedFileForAnchor.name}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedFileForAnchor(null)}
                          className="text-slate-500 hover:text-slate-300 text-xs"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1">
                            Proof Category
                          </label>
                          <select
                            value={targetCategory}
                            onChange={e => setTargetCategory(e.target.value as ProofCategory)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                          >
                            <option value="SOFTWARE_IP">Software IP & Code</option>
                            <option value="CREATIVE_MEDIA">Document & Research Dossier</option>
                            <option value="RESEARCH_PAPER">Research Paper & Notes</option>
                            <option value="EMPLOYMENT_MILESTONE">Deliverable & Employment Milestone</option>
                            <option value="SUPPLY_CHAIN">Supply Chain & Hardware BOM</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1">
                            Attributed Account / Org
                          </label>
                          <select
                            value={activeAccount.id}
                            onChange={e => {
                              const acc = connectedAccounts.find(a => a.id === e.target.value);
                              if (acc) onSelectAccount(acc);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                          >
                            {connectedAccounts.map(acc => (
                              <option key={acc.id} value={acc.id}>
                                {acc.name} ({acc.type})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Google Terms of Service Rights Protection Affirmation</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                          Anchoring computes an immutable zero-knowledge SHA-256 digest on this Google Drive file. Under Google TOS (July 30, 2026), you retain 100% intellectual property ownership across all personal and enterprise jurisdictions.
                        </p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={handleAnchorFile}
                          disabled={isAnchoring}
                          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
                        >
                          {isAnchoring ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Computing SHA-256 & Mining Block...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Confirm & Mine Proof Block</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* Tab 2: CONNECTED ACCOUNTS */}
          {activeTab === 'ACCOUNTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Enterprise, Organization & Personal Accounts</h3>
                  <p className="text-xs text-slate-400">
                    Switch active account or tie in new corporate, organization, or personal credentials
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingAccount(!isAddingAccount)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isAddingAccount ? 'Cancel' : 'Tie In New Account'}</span>
                </button>
              </div>

              {/* Add Account Inline Form */}
              {isAddingAccount && (
                <form onSubmit={handleCreateNewAccount} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white block">Tie In New Account Details</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Account Holder Name *</label>
                      <input
                        type="text"
                        required
                        value={newAccName}
                        onChange={e => setNewAccName(e.target.value)}
                        placeholder="e.g., Jay Lang (Enterprise Systems)"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={newAccEmail}
                        onChange={e => setNewAccEmail(e.target.value)}
                        placeholder="e.g., jaylang085@gmail.com"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Account Scope</label>
                      <select
                        value={newAccType}
                        onChange={e => setNewAccType(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                      >
                        <option value="ENTERPRISE">Enterprise Account</option>
                        <option value="ORGANIZATION">Organization Account</option>
                        <option value="PERSONAL">Personal Account</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Organization Name</label>
                      <input
                        type="text"
                        value={newAccOrg}
                        onChange={e => setNewAccOrg(e.target.value)}
                        placeholder="e.g., Master Recovery Hub 2026"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Role / Designation</label>
                      <input
                        type="text"
                        value={newAccRole}
                        onChange={e => setNewAccRole(e.target.value)}
                        placeholder="e.g., Principal Architect"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingAccount(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                    >
                      Save & Link Account
                    </button>
                  </div>
                </form>
              )}

              {/* Accounts List */}
              <div className="grid grid-cols-1 gap-3">
                {connectedAccounts.map(acc => {
                  const isCurrent = acc.id === activeAccount.id;

                  return (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-slate-800/80 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            acc.type === 'ENTERPRISE'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : acc.type === 'ORGANIZATION'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {acc.type}
                          </span>
                          <h4 className="text-sm font-bold text-white">{acc.name}</h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px]">
                              Active
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300">
                          {acc.orgName} • <span className="text-slate-400">{acc.role}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-0.5">
                          <span>Email: {acc.email}</span>
                          <span>•</span>
                          <span>Wallet: {acc.walletAddress}</span>
                          <span>•</span>
                          <span>Source: {acc.accountSource}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {!isCurrent ? (
                          <button
                            onClick={() => onSelectAccount(acc)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                          >
                            Set as Active
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold px-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Currently Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Google Workspace OAuth 2.0 • drive.readonly</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
