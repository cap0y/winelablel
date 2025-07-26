// Simple fallback for 3D visualization
// In a real implementation, you would use Three.js here
export function createStorageUnit3D(container: HTMLElement, size: string, dimensions: string): () => void {
  // For now, we'll create a simple CSS-based 3D effect
  // In production, you would implement actual Three.js rendering
  
  const canvas = document.createElement('div');
  canvas.className = 'w-full h-full flex items-center justify-center';
  
  const unit = document.createElement('div');
  unit.className = 'w-20 h-20 bg-gray-300 rounded-lg relative transform rotate-3d shadow-lg';
  
  const interior = document.createElement('div');
  interior.className = 'absolute inset-2 bg-white rounded-md';
  
  // Add some items based on size
  const items = [];
  if (size === 'SB' || size === '0.5M') {
    items.push(createItem('w-4 h-6 bg-blue-400 rounded-sm', 'top-2 left-2'));
    items.push(createItem('w-4 h-6 bg-green-400 rounded-sm', 'top-2 right-2'));
    items.push(createItem('w-8 h-4 bg-orange-400 rounded-sm', 'bottom-2 left-2'));
  } else if (size === 'M') {
    items.push(createItem('w-6 h-8 bg-blue-400 rounded-sm', 'top-1 left-1'));
    items.push(createItem('w-6 h-8 bg-green-400 rounded-sm', 'top-1 right-1'));
    items.push(createItem('w-10 h-6 bg-orange-400 rounded-sm', 'bottom-1 left-1'));
    items.push(createItem('w-4 h-4 bg-red-400 rounded-sm', 'bottom-1 right-1'));
  }
  
  items.forEach(item => interior.appendChild(item));
  
  const handle = document.createElement('div');
  handle.className = 'absolute right-1 top-1 w-2 h-8 bg-primary rounded-sm';
  
  unit.appendChild(interior);
  unit.appendChild(handle);
  canvas.appendChild(unit);
  
  container.innerHTML = '';
  container.appendChild(canvas);
  
  return () => {
    container.innerHTML = '';
  };
}

function createItem(className: string, position: string): HTMLElement {
  const item = document.createElement('div');
  item.className = `absolute ${className} ${position}`;
  return item;
}
