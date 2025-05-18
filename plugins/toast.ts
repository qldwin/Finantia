import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('toast', {
    add({ color = 'blue', title = '', description = '', timeout = 5000 }) {
      // Créer l'élément toast
      const toastContainer = document.querySelector('.toast-container') || createToastContainer();
      const toast = document.createElement('div');
      
      toast.className = `toast toast-${color} fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 opacity-100 z-50 flex flex-col gap-1 mb-2`;
      toast.style.backgroundColor = getBackgroundColor(color);
      toast.style.color = getTextColor(color);
      toast.style.borderWidth = '1px';
      toast.style.borderColor = getBorderColor(color);
      
      // Contenu du toast
      if (title) {
        const titleElem = document.createElement('div');
        titleElem.className = 'font-medium text-sm';
        titleElem.textContent = title;
        toast.appendChild(titleElem);
      }
      
      if (description) {
        const descElem = document.createElement('div');
        descElem.className = 'text-sm';
        descElem.textContent = description;
        toast.appendChild(descElem);
      }
      
      // Ajouter le toast au conteneur
      toastContainer.appendChild(toast);
      
      // Animation d'entrée
      setTimeout(() => {
        toast.classList.add('slide-in');
      }, 10);
      
      // Gérer la fermeture du toast
      setTimeout(() => {
        toast.classList.add('slide-out');
        setTimeout(() => {
          toastContainer.removeChild(toast);
          if (toastContainer.childNodes.length === 0) {
            document.body.removeChild(toastContainer);
          }
        }, 300);
      }, timeout);
    }
  });
});

// Fonctions utilitaires
function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container fixed bottom-4 right-4 flex flex-col gap-2 z-50';
  document.body.appendChild(container);
  return container;
}

function getBackgroundColor(color: string) {
  switch (color) {
    case 'red': return 'rgb(254 226 226)'; // bg-red-100
    case 'green': return 'rgb(220 252 231)'; // bg-green-100
    case 'blue': return 'rgb(219 234 254)'; // bg-blue-100
    case 'yellow': return 'rgb(254 249 195)'; // bg-yellow-100
    default: return 'rgb(243 244 246)'; // bg-neutral-100
  }
}

function getTextColor(color: string) {
  switch (color) {
    case 'red': return 'rgb(185 28 28)'; // text-red-700
    case 'green': return 'rgb(21 128 61)'; // text-green-700
    case 'blue': return 'rgb(29 78 216)'; // text-blue-700
    case 'yellow': return 'rgb(161 98 7)'; // text-yellow-700
    default: return 'rgb(55 65 81)'; // text-neutral-700
  }
}

function getBorderColor(color: string) {
  switch (color) {
    case 'red': return 'rgb(254 202 202)'; // border-red-200
    case 'green': return 'rgb(187 247 208)'; // border-green-200
    case 'blue': return 'rgb(191 219 254)'; // border-blue-200
    case 'yellow': return 'rgb(254 240 138)'; // border-yellow-200
    default: return 'rgb(229 231 235)'; // border-neutral-200
  }
}

// Ajouter le style pour l'animation
if (process.client) {
  const style = document.createElement('style');
  style.innerHTML = `
    .slide-in {
      transform: translateX(0);
      opacity: 1;
    }
    .slide-out {
      transform: translateX(100%);
      opacity: 0;
    }
    .toast {
      transform: translateX(100%);
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
  `;
  document.head.appendChild(style);
} 