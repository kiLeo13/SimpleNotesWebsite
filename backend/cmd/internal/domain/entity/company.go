package entity

type RegistrationStatus string

const (
	RegistrationStatusActive    RegistrationStatus = "ACTIVE"
	RegistrationStatusClosed    RegistrationStatus = "CLOSED"
	RegistrationStatusSuspended RegistrationStatus = "SUSPENDED"
	RegistrationStatusUnfit     RegistrationStatus = "UNFIT"
	RegistrationStatusUnknown   RegistrationStatus = "UNKNOWN"
)

type Company struct {
	CNPJ                string `gorm:"primaryKey;column:cnpj"`
	LegalName           string
	TradeName           string
	LegalNature         string
	CompanySize         string
	BusinessStartDate   string
	ShareCapital        int64
	RegistrationStatus  RegistrationStatus
	RegistrationReason  string
	RegistrationDate    string
	AddressType         string
	AddressStreetName   string
	AddressNumber       string
	AddressNeighborhood string
	AddressZipCode      string
	AddressCity         string
	AddressRegion       string

	// Found controls the negative caching strategy for external API lookups:
	//
	// - true: The CNPJ is valid and the company data is cached.
	//
	// - false: The CNPJ was queried, returned a 404, and is safely cached as invalid.
	//
	// This prevents repeated API calls for CNPJs that we already know do not exist.
	Found    bool
	CachedAt int64 `gorm:"autoUpdateTime:false"`

	// Relationships
	Partners []*CompanyPartner `gorm:"foreignKey:CompanyCNPJ;references:CNPJ;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

type CompanyPartner struct {
	ID          int64  `gorm:"primaryKey;autoIncrement:false"`
	CompanyCNPJ string `gorm:"uniqueIndex:idx_company_partner_cnpj_name;index"`
	Name        string `gorm:"uniqueIndex:idx_company_partner_cnpj_name"`
	Role        string
	RoleCode    int
	AgeRange    string
}
