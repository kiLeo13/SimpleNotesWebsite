package minhareceita

import (
	"strings"
	"zenkeep/cmd/internal/domain/entity"
)

type companyResponse struct {
	CNPJ                     string `json:"cnpj"`
	LegalName                string `json:"razao_social"`
	TradeName                string `json:"nome_fantasia"`
	LegalNature              string `json:"natureza_juridica"`
	CompanySize              string `json:"porte"`
	BusinessStartDate        string `json:"data_inicio_atividade"`
	RegistrationStatus       string `json:"descricao_situacao_cadastral"`
	RegistrationStatusReason string `json:"descricao_motivo_situacao_cadastral"`
	RegistrationStatusDate   string `json:"data_situacao_cadastral"`
	ShareCapital             int64  `json:"capital_social"`

	AddressType         string `json:"descricao_tipo_de_logradouro"`
	AddressStreetName   string `json:"logradouro"`
	AddressNumber       string `json:"numero"`
	AddressNeighborhood string `json:"bairro"`
	AddressCity         string `json:"municipio"`
	AddressZipCode      string `json:"cep"`
	AddressRegion       string `json:"uf"`

	Partners []*partnerResponse `json:"qsa"`
}

type partnerResponse struct {
	Name     string `json:"nome_socio"`
	Role     string `json:"qualificacao_socio"`
	RoleCode int    `json:"codigo_qualificacao_socio"`
	AgeRange string `json:"faixa_etaria"`
}

func (c *companyResponse) ToDomain() *entity.Company {
	var partners []*entity.CompanyPartner
	for _, p := range c.Partners {
		partners = append(partners, &entity.CompanyPartner{
			Name:     p.Name,
			Role:     p.Role,
			RoleCode: p.RoleCode,
			AgeRange: p.AgeRange,
		})
	}

	return &entity.Company{
		CNPJ:                c.CNPJ,
		LegalName:           c.LegalName,
		TradeName:           c.TradeName,
		LegalNature:         c.LegalNature,
		CompanySize:         c.CompanySize,
		BusinessStartDate:   c.BusinessStartDate,
		ShareCapital:        c.ShareCapital,
		RegistrationStatus:  translateRegistrationStatus(c.RegistrationStatus),
		RegistrationReason:  c.RegistrationStatusReason,
		RegistrationDate:    c.RegistrationStatusDate,
		AddressType:         c.AddressType,
		AddressStreetName:   c.AddressStreetName,
		AddressNumber:       c.AddressNumber,
		AddressNeighborhood: c.AddressNeighborhood,
		AddressZipCode:      c.AddressZipCode,
		AddressCity:         c.AddressCity,
		AddressRegion:       c.AddressRegion,
		Partners:            partners,
	}
}

func translateRegistrationStatus(status string) entity.RegistrationStatus {
	switch strings.ToUpper(status) {
	case "ATIVA":
		return entity.RegistrationStatusActive
	case "BAIXADA":
		return entity.RegistrationStatusClosed
	case "SUSPENSA":
		return entity.RegistrationStatusSuspended
	case "INAPTA":
		return entity.RegistrationStatusUnfit
	default:
		return entity.RegistrationStatusUnknown
	}
}
