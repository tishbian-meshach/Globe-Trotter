import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FaCity, FaClock, FaDollarSign } from 'react-icons/fa';

interface City {
    id: string;
    name: string;
    country: string;
    region?: string | null;
    description: string | null;
    costIndex: number;
    popularity: number;
    imageUrl?: string | null;
    attractions?: any[];
}

interface CityDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    city: City | null;
}

export function CityDetailsModal({ isOpen, onClose, city }: CityDetailsModalProps) {
    if (!city) return null;

    const getCostLevel = (costIndex: number) => {
        if (costIndex < 30) return { label: 'Budget-Friendly', variant: 'success' as const };
        if (costIndex < 60) return { label: 'Moderate', variant: 'warning' as const };
        return { label: 'Expensive', variant: 'danger' as const };
    };

    const costLevel = getCostLevel(city.costIndex);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={city.name} size="lg">
            <div className="space-y-6">
                {/* Hero Image */}
                <div className="bg-slate-100 rounded-xl overflow-hidden h-64 md:h-80 relative">
                    {city.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={city.imageUrl}
                            alt={city.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-primary-500 flex items-center justify-center">
                            <FaCity className="text-white text-5xl" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">{city.name}</h2>
                            <p className="text-white/90 text-lg">{city.country} • {city.region}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1">Cost Level</div>
                        <Badge variant={costLevel.variant} className="text-base px-3 py-1">
                            {costLevel.label} ({city.costIndex}/100)
                        </Badge>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1">Popularity</div>
                        <div className="flex items-center gap-1">
                            <span className="text-lg font-semibold text-slate-900">{city.popularity}/100</span>
                            <div className="flex text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.floor(city.popularity / 20) ? 'fill-current' : 'fill-slate-300'}`}
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">About</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        {city.description || 'No description available for this city.'}
                    </p>
                </div>

                {/* Attractions */}
                {city.attractions && city.attractions.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Top Things to Do</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {city.attractions.map((attraction) => (
                                <div key={attraction.id} className="p-3 border border-slate-200 rounded-lg hover:border-primary-400 transition-colors bg-white">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-slate-900">{attraction.name}</h4>
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 capitalize">
                                            {attraction.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-2">{attraction.description}</p>
                                    <div className="flex gap-3 mt-2 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><FaClock className="w-3 h-3" /> {attraction.duration} min</span>
                                        <span className="flex items-center gap-1"><FaDollarSign className="w-3 h-3" /> {attraction.cost === 0 ? 'Free' : `${attraction.cost}`}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
}
