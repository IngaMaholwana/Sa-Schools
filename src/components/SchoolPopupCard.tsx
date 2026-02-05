import { School } from "@/data/schools";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  GraduationCap, 
  MapPin, 
  Building2, 
  Phone, 
  Hash,
  Globe,
  Home,
  Mail,
  User,
  Landmark,
  Map
} from "lucide-react";

interface SchoolPopupCardProps {
  school: School;
}

export function SchoolPopupCard({ school }: SchoolPopupCardProps) {
  const phaseColors: Record<string, string> = {
    "PRIMARY SCHOOL": "bg-emerald-500 text-white",
    "SECONDARY SCHOOL": "bg-blue-500 text-white",
    "COMBINED SCHOOL": "bg-purple-500 text-white",
  };

  const phaseColor = phaseColors[school.phase] || "bg-secondary text-secondary-foreground";

  return (
    <div className="w-full max-w-sm space-y-3 text-sm">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base leading-tight">{school.name}</h3>
          {school.status && (
            <Badge variant={school.status === 'OPEN' ? 'default' : 'secondary'} className="shrink-0 text-xs">
              {school.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Hash className="h-3.5 w-3.5" />
          <span>NatEmis: {school.id}</span>
        </div>
        {school.schoolType && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span>{school.schoolType}</span>
          </div>
        )}
        {school.specialisation && school.specialisation !== 'ORDINARY' && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>{school.specialisation}</span>
          </div>
        )}
        {school.examCentre && (
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <span className="text-muted-foreground">Exam Centre:</span>
            <span>{school.examCentre}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Contact Section */}
      {(school.addressee || school.telephone) && (
        <>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact</p>
            {school.addressee && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>{school.addressee}</span>
              </div>
            )}
            {school.telephone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <a href={`tel:${school.telephone.replace(/\s/g, '')}`} className="text-primary hover:underline">
                  {school.telephone}
                </a>
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Address Section */}
      {(school.streetAddress || school.postalAddress || school.township || school.suburb || school.town) && (
        <>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address</p>
            {school.streetAddress && (
              <div className="flex items-start gap-1.5">
                <Home className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="break-words">{school.streetAddress}</span>
              </div>
            )}
            {school.postalAddress && school.postalAddress !== school.streetAddress && (
              <div className="flex items-start gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="break-words">{school.postalAddress}</span>
              </div>
            )}
            {(school.township || school.suburb) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>{[school.township, school.suburb].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {school.town && (
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>{school.town}</span>
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Coordinates */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Coordinates</p>
        <div className="flex items-center gap-1.5">
          <Map className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-mono text-xs">
            Lat: {school.latitude.toFixed(4)} | Lng: {school.longitude.toFixed(4)}
          </span>
        </div>
      </div>

      <Separator />

      {/* Administrative Section */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Administrative</p>
        <div className="grid gap-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">District:</span>
            <span className="font-medium text-right">{school.district}</span>
          </div>
          {school.circuit && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Circuit:</span>
              <span className="font-medium">{school.circuit}</span>
            </div>
          )}
          {school.municipality && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Municipality:</span>
              <span className="font-medium text-right">{school.municipality}</span>
            </div>
          )}
          {school.localMunicipality && school.localMunicipality !== school.municipality && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Local Municipality:</span>
              <span className="font-medium text-right">{school.localMunicipality}</span>
            </div>
          )}
          {school.wardId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ward ID:</span>
              <span className="font-medium">{school.wardId}</span>
            </div>
          )}
          {school.exDept && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ex-Department:</span>
              <span className="font-medium text-right">{school.exDept}</span>
            </div>
          )}
          {school.ownerLand && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Land Owner:</span>
              <span className="font-medium text-right">{school.ownerLand}</span>
            </div>
          )}
          {school.ownerBuildings && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Building Owner:</span>
              <span className="font-medium text-right">{school.ownerBuildings}</span>
            </div>
          )}
          {school.spName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">SP Name:</span>
              <span className="font-medium text-right">{school.spName}</span>
            </div>
          )}
          {school.registrationDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registered:</span>
              <span className="font-medium">{school.registrationDate}</span>
            </div>
          )}
          {school.dataYear && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Year:</span>
              <span className="font-medium">{school.dataYear}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
          <Users className="h-4 w-4 text-primary" />
          <div>
            <p className="font-bold">{school.learners.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Learners</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <div>
            <p className="font-bold">{school.educators}</p>
            <p className="text-xs text-muted-foreground">Educators</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-xs">
          <Landmark className="h-3 w-3 mr-1" />
          {school.province}
        </Badge>
        <Badge className={`text-xs ${phaseColor}`}>
          {school.phase.replace(" SCHOOL", "")}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {school.sector === "PUBLIC" ? "Public" : "Independent"}
        </Badge>
        {school.quintile && school.quintile !== 'Unknown' && (
          <Badge variant="outline" className="text-xs">{school.quintile}</Badge>
        )}
        {school.noFeeSchool && (
          <Badge variant="secondary" className="text-xs bg-accent/20 text-accent">
            No-Fee
          </Badge>
        )}
        {school.urbanRural && (
          <Badge variant="outline" className="text-xs">{school.urbanRural}</Badge>
        )}
        {school.section21 && (
          <Badge variant="outline" className="text-xs">Section 21</Badge>
        )}
        {school.fullServiceSchool && (
          <Badge variant="outline" className="text-xs">Full Service</Badge>
        )}
      </div>
    </div>
  );
}
