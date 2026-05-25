output "aks_cluster_name" {
  description = "Nome do cluster AKS"
  value       = azurerm_kubernetes_cluster.aks.name
}

output "acr_login_server" {
  description = "URL de login do Azure Container Registry"
  value       = azurerm_container_registry.acr.login_server
}

output "kubeconfig_command" {
  description = "Comando para configurar o kubectl localmente"
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_kubernetes_cluster.aks.name}"
}