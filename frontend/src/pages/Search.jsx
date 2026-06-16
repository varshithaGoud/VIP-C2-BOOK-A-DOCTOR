import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, Star, Award, Stethoscope, MapPin, Loader2, ArrowUpDown } from 'lucide-react';
import { doctorService } from '../services/api';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  
  // Recommendation Lists
  const [recommended, setRecommended] = useState([]);
  const [similar, setSimilar] = useState([]);
  
  // Filter Fields
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('highest_rated');

  // Load and apply search filters
  const fetchDoctorsList = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        search: searchParams.get('search') || undefined,
        specialization: searchParams.get('specialization') || undefined,
        experience: searchParams.get('experience') || undefined,
        minFee: searchParams.get('minFee') || undefined,
        maxFee: searchParams.get('maxFee') || undefined,
        rating: searchParams.get('rating') || undefined,
        sort: searchParams.get('sort') || 'highest_rated'
      };

      const { data } = await doctorService.getDoctors(params);
      setDoctors(data.doctors || []);
      setTotalPages(data.pages || 1);
      
      // Load Recommendations based on currently searched specialization
      const recParams = {
        specialization: params.specialization || undefined
      };
      const recData = await doctorService.getRecommendations(recParams);
      setRecommended(recData.data.recommended || []);
      setSimilar(recData.data.similar || []);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load doctors search directory:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorsList();
  }, [searchParams, page]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    
    const newParams = {};
    if (search) newParams.search = search;
    if (specialization) newParams.specialization = specialization;
    if (experience) newParams.experience = experience;
    if (minFee) newParams.minFee = minFee;
    if (maxFee) newParams.maxFee = maxFee;
    if (rating) newParams.rating = rating;
    if (sort) newParams.sort = sort;
    
    setPage(1); // Reset page on filter apply
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSpecialization('');
    setExperience('');
    setMinFee('');
    setMaxFee('');
    setRating('');
    setSort('highest_rated');
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Find & Book Top Doctors</h1>
        <p className="text-sm text-slate-400">Search clinics, specialists, hospitals, and available time slots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Filter Form Panel */}
        <div className="glass-card p-6 border border-slate-200/50 sticky top-20">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <h2 className="font-extrabold text-sm flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-primary-500" />
              <span>Search Filters</span>
            </h2>
            <button onClick={handleClearFilters} className="text-xs font-semibold text-slate-400 hover:text-primary-600">
              Clear All
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4 text-xs font-semibold">
            {/* Search query */}
            <div className="space-y-1">
              <label className="form-label text-[10px]">Keyword Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Doctor, clinic, hospital..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input pl-9"
                />
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Speciality dropdown */}
            <div className="space-y-1">
              <label className="form-label text-[10px]">Specialization</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="form-input"
              >
                <option value="">All Specialities</option>
                {['General Physician', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Dentist'].map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Experience range */}
            <div className="space-y-1">
              <label className="form-label text-[10px]">Min Experience (Years)</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Fee ranges */}
            <div className="space-y-1">
              <label className="form-label text-[10px]">Consultation Fee Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minFee}
                  onChange={(e) => setMinFee(e.target.value)}
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Minimum rating */}
            <div className="space-y-1">
              <label className="form-label text-[10px]">Minimum Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="form-input"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>

            {/* Sort sorting */}
            <div className="space-y-1">
              <label className="form-label text-[10px]">Sort Results By</label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="form-input pl-9"
                >
                  <option value="highest_rated">Highest Rated</option>
                  <option value="lowest_fee">Lowest Fee First</option>
                  <option value="most_experienced">Most Experienced</option>
                  <option value="most_popular">Most Popular</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-2.5 rounded-xl font-bold mt-4">
              Apply Filters
            </button>
          </form>
        </div>

        {/* Center/Right Side: Doctor Cards Grid & Sidebar Recommendations */}
        <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Doctor Cards list */}
          <div className="xl:col-span-3 space-y-6">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-2" />
                <p className="text-xs font-semibold">Filtering matches...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="glass-card p-16 text-center border-dashed border-2 rounded-2xl max-w-lg mx-auto">
                <SlidersHorizontal className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200">No Match Found</h3>
                <p className="text-xs text-slate-400 mt-2">Try clarifying your keywords or reducing some filters.</p>
                <button onClick={handleClearFilters} className="btn-primary rounded-xl px-4 py-2 mt-6 text-xs mx-auto">
                  Reset Search
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {doctors.map((doc) => (
                    <div key={doc._id} className="glass-card-hover p-5 border border-slate-200/50 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-4 items-start">
                          {doc.userId?.profileImage ? (
                            <img src={doc.userId.profileImage.startsWith('/') ? `http://localhost:5001${doc.userId.profileImage}` : doc.userId.profileImage} alt={doc.userId.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary-500/10 shadow-sm" />
                          ) : (
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl ring-2 ring-primary-500/10 shadow-sm uppercase">
                              {doc.userId?.name?.charAt(0)}
                            </div>
                          )}
                          <div className="space-y-1 min-w-0">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-extrabold text-[9px] uppercase tracking-wide">
                              {doc.specialization}
                            </span>
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white truncate">Dr. {doc.userId?.name}</h3>
                            <p className="text-[10px] text-slate-450 dark:text-slate-400 truncate">{doc.qualification}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 text-xs font-semibold text-slate-500">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-primary-500 shrink-0" />
                            <span>{doc.experience} Years Clinic Experience</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-primary-500 shrink-0" />
                            <span className="truncate">{doc.hospitalName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary-500 shrink-0" />
                            <span className="truncate">{doc.clinicAddress}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">CONSULTATION FEE</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 text-base">${doc.consultationFee}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{doc.rating}</span>
                            <span className="text-[9px] text-slate-400 font-medium">({doc.totalReviews})</span>
                          </div>
                          <Link to={`/doctor/${doc._id}`} className="btn-primary py-1.5 rounded-xl px-4 text-xs font-bold shadow-sm">
                            Book Slot
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold border transition-all ${page === i + 1 ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Side: Recommendation Columns */}
          <div className="space-y-6">
            
            {/* Similar Specialists sidebar widget */}
            {similar.length > 0 && (
              <div className="glass-card p-5 border border-slate-200/50 space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-450 border-b pb-2">Similar Specialists</h3>
                <div className="space-y-3">
                  {similar.slice(0, 3).map((doc) => (
                    <Link to={`/doctor/${doc._id}`} key={doc._id} className="flex gap-3 hover:opacity-85 group">
                      {doc.userId?.profileImage ? (
                        <img src={doc.userId.profileImage.startsWith('/') ? `http://localhost:5001${doc.userId.profileImage}` : doc.userId.profileImage} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                          {doc.userId?.name?.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-bold text-xs truncate group-hover:text-primary-600 transition-colors">Dr. {doc.userId?.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{doc.specialization} • {doc.experience}y exp</p>
                        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                          <Star className="h-3 w-3 fill-current" />
                          <span>{doc.rating}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended/Trending sidebar widget */}
            <div className="glass-card p-5 border border-slate-200/50 space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-450 border-b pb-2">Top Rated Doctors</h3>
              <div className="space-y-3">
                {recommended.slice(0, 3).map((doc) => (
                  <Link to={`/doctor/${doc._id}`} key={doc._id} className="flex gap-3 hover:opacity-85 group">
                    {doc.userId?.profileImage ? (
                      <img src={doc.userId.profileImage.startsWith('/') ? `http://localhost:5001${doc.userId.profileImage}` : doc.userId.profileImage} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                        {doc.userId?.name?.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-bold text-xs truncate group-hover:text-primary-600 transition-colors">Dr. {doc.userId?.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{doc.specialization} • ${doc.consultationFee}</p>
                      <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{doc.rating}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Search;
