import React, { useState, useEffect } from "react";
import { useStore, FieldNote } from "../store/useStore";
import {
  FileText,
  Plus,
  X,
  Clock,
  User,
  Trash2,
  MapPin,
  Upload,
  Search,
  Mail
} from "./ui/solar-icons";

// List of all 77 Districts of Nepal
const NEPAL_DISTRICTS = [
  "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke", "Bara", "Bardiya", "Bhaktapur",
  "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh", "Dang", "Darchula", "Dhading", "Dhankuta", "Dhanusa", "Dolakha",
  "Dolpa", "Doti", "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla", "Kailali", "Kalikot",
  "Kanchanpur", "Kapilvastu", "Kaski", "Kathmandu", "Kavrepalanchok", "Khotang", "Lalitpur", "Lamjung",
  "Mahottari", "Makwanpur", "Manang", "Morang", "Mugu", "Mustang", "Myagdi", "Nawalpur", "Nuwakot",
  "Okhaldhunga", "Palpa", "Panchthar", "Parbat", "Parsa", "Pyuthan", "Ramechhap", "Rasuwa", "Rautahat", "Rolpa",
  "Rukum East", "Rukum West", "Rupandehi", "Salyan", "Sankhuwasabha", "Saptari", "Sarlahi", "Sindhuli",
  "Sindhupalchok", "Siraha", "Solukhumbu", "Sunsari", "Surkhet", "Syangja", "Tanahun", "Taplejung",
  "Terhathum", "Udayapur"
].sort();

interface FieldNotesProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editingCampaign: FieldNote | null;
  setEditingCampaign: (campaign: FieldNote | null) => void;
}

export const FieldNotes: React.FC<FieldNotesProps> = ({
  showModal,
  setShowModal,
  editingCampaign,
  setEditingCampaign
}) => {
  const {
    campaigns: fieldNotes, // campaigns store state holds our FieldNote data
    createCampaign: createFieldNote,
    updateCampaign: updateFieldNote,
    deleteCampaign: deleteFieldNote,
    user
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [fittingSpotImageUrl, setFittingSpotImageUrl] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  useEffect(() => {
    if (editingCampaign) {
      setTitle(editingCampaign.title || "");
      setDescription(editingCampaign.description || "");
      setDistrict(editingCampaign.district || "");
      setDistrictSearch(editingCampaign.district || "");
      setLocation(editingCampaign.location || "");
      setFittingSpotImageUrl(editingCampaign.fittingSpotImageUrl || "");
      setEmail(editingCampaign.email || "");
    }
  }, [editingCampaign]);

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setTitle("");
    setDescription("");
    setDistrict("");
    setDistrictSearch("");
    setLocation("");
    setFittingSpotImageUrl("");
    setEmail("");
    setFormError("");
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setFormError("Fitting spot image size should be less than 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFittingSpotImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !description.trim() || !district || !location.trim()) {
      setFormError("All required fields must be filled (Title, Description, District, Location).");
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim(),
      district,
      location: location.trim(),
      fittingSpotImageUrl,
      email: email.trim() || undefined
    };

    try {
      if (editingCampaign) {
        await updateFieldNote(editingCampaign._id, data);
      } else {
        await createFieldNote(data);
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save field note.");
    }
  };

  // Filter list
  const filteredNotes = fieldNotes.filter((note) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      note.title.toLowerCase().includes(search) ||
      note.description.toLowerCase().includes(search) ||
      note.district.toLowerCase().includes(search) ||
      note.location.toLowerCase().includes(search) ||
      (note.email && note.email.toLowerCase().includes(search));

    const matchesDistrict = districtFilter === "all" || note.district === districtFilter;

    return matchesSearch && matchesDistrict;
  });

  const filteredDistricts = NEPAL_DISTRICTS.filter((d) =>
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display flex items-center gap-2">
            <FileText className="text-accent" />
            Field Notes Workspace
          </h1>
          <p className="text-muted text-sm mt-1">
            Log fitting spots details, upload site mockups, and track installation locations in districts across Nepal.
          </p>
        </div>

        {/* Entry option for STAFF ONLY, NOT ADMINS */}
        {user?.role === "staff" && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded font-semibold text-sm hover:bg-accent-dark transition-colors shadow-md shadow-accent/15 self-start sm:self-auto"
          >
            <Plus size={16} />
            Create Field Note
          </button>
        )}
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border pb-4">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search field notes by title, district, town, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
          />
        </div>

        {/* District Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">District:</span>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-xs font-semibold cursor-pointer w-full md:w-48"
          >
            <option value="all">All Districts</option>
            {NEPAL_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CARDS LISTING */}
      {filteredNotes.length === 0 ? (
        <div className="text-center p-12 glass-panel rounded-lg text-muted text-sm border border-dashed border-border/80">
          <FileText size={48} className="opacity-25 mx-auto mb-3" />
          No field notes logged for the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            // Admins can edit any note. Staff can edit only their own note.
            const canEdit = user?.role === "admin" || note.createdBy?._id === user?._id;

            return (
              <div
                key={note._id}
                className="glass-panel bg-card/40 border border-border p-5 rounded-lg shadow-sm flex flex-col justify-between space-y-4 hover:border-accent/40 transition-all group"
              >
                <div className="space-y-3">
                  {/* Fitting Spot Image */}
                  {note.fittingSpotImageUrl ? (
                    <div className="h-44 rounded-md border border-border overflow-hidden bg-background relative">
                      <img
                        src={note.fittingSpotImageUrl}
                        alt={note.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-44 rounded-md border border-dashed border-border bg-background/50 flex flex-col items-center justify-center text-center p-4 text-muted">
                      <Upload size={24} className="opacity-20 mb-1.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">No Site Mockup Image</span>
                    </div>
                  )}

                  {/* Header details */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {note.title}
                    </h3>
                    
                    {/* Location detail */}
                    <div className="flex items-center gap-1 text-xs font-semibold text-accent/80">
                      <MapPin size={12} />
                      <span className="truncate">{note.district}, {note.location}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted leading-relaxed font-sans line-clamp-4">
                    {note.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/50">
                  {/* Metadata Row */}
                  <div className="flex flex-col gap-1.5 text-[10px] text-muted">
                    {note.email && (
                      <span className="flex items-center gap-1 truncate font-medium text-foreground/80">
                        <Mail size={11} className="text-accent" />
                        {note.email}
                      </span>
                    )}
                    <div className="flex justify-between items-center text-[9px] font-semibold uppercase tracking-wider mt-0.5">
                      <span className="flex items-center gap-1">
                        <User size={10} />
                        {note.createdBy?.name || "Deleted Staff"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-1">
                    {/* Soft Delete to Trash Bin (Admin only) */}
                    {user?.role === "admin" ? (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${note.title}" and send it to the Trash Bin?`)) {
                            deleteFieldNote(note._id);
                          }
                        }}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors shadow-sm"
                        title="Delete to Bin"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : (
                      <div />
                    )}

                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingCampaign(note);
                          setShowModal(true);
                        }}
                        className="text-xs text-accent hover:text-accent-dark bg-accent/5 hover:bg-accent/10 border border-accent/25 px-3 py-1.5 rounded font-semibold transition-colors uppercase tracking-wider"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 mt-16 sm:mt-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-lg rounded-lg border border-border p-6 shadow-2xl animate-scale-up overflow-y-auto max-h-[calc(100vh-6rem)] sm:max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <FileText className="text-accent" size={20} />
                {editingCampaign ? "Edit Field Note Details" : "Create New Field Note"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-foreground p-1"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-600 border border-red-600 text-white text-xs font-semibold rounded animate-slide-up">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Title / Fitting Task Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                  placeholder="e.g. Lobby neon sign placement mock"
                  required
                />
              </div>

              {/* District & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Searchable Autocomplete District Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={districtSearch}
                    onFocus={() => setShowDistrictDropdown(true)}
                    onChange={(e) => {
                      setDistrictSearch(e.target.value);
                      setDistrict(e.target.value);
                      setShowDistrictDropdown(true);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    placeholder="Search Nepal district..."
                    required
                  />
                  {showDistrictDropdown && filteredDistricts.length > 0 && (
                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-40 overflow-y-auto bg-card border border-border rounded shadow-lg text-sm divide-y divide-border">
                      {filteredDistricts.map((d) => (
                        <div
                          key={d}
                          onClick={() => {
                            setDistrict(d);
                            setDistrictSearch(d);
                            setShowDistrictDropdown(false);
                          }}
                          className="px-3 py-2 hover:bg-border cursor-pointer transition-colors"
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location / Village / City */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Location / City / Village <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    placeholder="e.g. Balkot Ward-3 near school"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Contact/Client Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                  placeholder="client@example.com"
                />
              </div>

              {/* Fitting spot Image upload */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Fitting Spot Location Mockup Image
                </label>
                <div className="flex gap-4 items-center mt-1">
                  <label className="flex flex-col items-center justify-center border border-dashed border-border rounded px-4 py-3 hover:bg-border/40 cursor-pointer transition-colors bg-background shrink-0">
                    <Upload size={18} className="text-accent" />
                    <span className="text-[10px] font-bold uppercase mt-1">Select File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {fittingSpotImageUrl ? (
                    <div className="h-16 w-24 relative rounded border border-border overflow-hidden bg-background">
                      <img src={fittingSpotImageUrl} alt="Upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFittingSpotImageUrl("")}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded-full hover:bg-black"
                        title="Remove Image"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">No image uploaded yet</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Description / Fitting Specifications <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-28 p-3 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-none text-sm"
                  placeholder="Enter detailed measurements, surface type (wood, cement, glass), wall bracket spacing, or general installation notes..."
                  required
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-border rounded text-sm hover:bg-border transition-colors font-medium text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white rounded text-sm hover:bg-accent-dark transition-colors shadow-md shadow-accent/15 font-bold uppercase tracking-wider"
                >
                  {editingCampaign ? "Save Note" : "Create Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
