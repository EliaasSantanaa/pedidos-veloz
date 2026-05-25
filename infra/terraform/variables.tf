variable "location" {
  description = "Regiao Azure onde os recursos serao provisionados"
  type        = string
  default     = "brazilsouth"
}

variable "environment" {
  description = "Ambiente de deploy (prod, staging)"
  type        = string
  default     = "prod"
  validation {
    condition     = contains(["prod", "staging"], var.environment)
    error_message = "O ambiente deve ser prod ou staging."
  }
}

variable "kubernetes_version" {
  description = "Versao do Kubernetes no AKS"
  type        = string
  default     = "1.29"
}

variable "node_count" {
  description = "Numero inicial de nos do cluster"
  type        = number
  default     = 2
}

variable "node_vm_size" {
  description = "Tamanho das VMs dos nos do cluster"
  type        = string
  default     = "Standard_D2s_v3"
}