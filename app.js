// Item List Builder - app.js
// Handles list creation, item management, modal display, and PDF export

// --- DOM Elements ---
const listSelector = document.getElementById('list-selector');
const newListForm = document.getElementById('new-list-form');
const newListNameInput = document.getElementById('new-list-name');
const deleteListBtn = document.getElementById('delete-list');
const exportPdfBtn = document.getElementById('export-pdf');
const itemForm = document.getElementById('item-form');
const itemNameInput = document.getElementById('item-name');
const itemPriceInput = document.getElementById('item-price');
const itemImageInput = document.getElementById('item-image');
const cameraBtn = document.getElementById('camera-btn');
const cameraInput = document.getElementById('camera-input');
const cameraPreview = document.getElementById('camera-preview');
let cameraImageData = '';
const clearListBtn = document.getElementById('clear-list');
const itemList = document.getElementById('item-list');
const itemCount = document.getElementById('item-count');
// Modal
const itemModal = document.getElementById('item-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalImage = document.getElementById('modal-image');
const modalEditName = document.getElementById('modal-edit-name');
const modalEditPrice = document.getElementById('modal-edit-price');
const modalEditImage = document.getElementById('modal-edit-image');
const modalUploadBtn = document.getElementById('modal-upload-btn');
const modalCameraBtn = document.getElementById('modal-camera-btn');
const modalCameraInput = document.getElementById('modal-camera-input');
const modalCameraPreview = document.getElementById('modal-camera-preview');
const modalSaveBtn = document.getElementById('modal-save');
const modalCancelBtn = document.getElementById('modal-cancel');
let modalEditIdx = null;
let modalModalImageData = '';

// --- State ---
let lists = {};
let currentList = null;

// --- Local Storage ---
function saveLists() {
  localStorage.setItem('itemLists', JSON.stringify(lists));
  localStorage.setItem('currentList', currentList);
}
function loadLists() {
  lists = JSON.parse(localStorage.getItem('itemLists')) || {};
  currentList = localStorage.getItem('currentList') || null;
}

// --- List Management ---
function updateListSelector() {
  listSelector.innerHTML = '';
  Object.keys(lists).forEach(listName => {
    const opt = document.createElement('option');
    opt.value = listName;
    opt.textContent = listName;
    if (listName === currentList) opt.selected = true;
    listSelector.appendChild(opt);
  });
}
function selectList(listName) {
  currentList = listName;
  saveLists();
  renderItems();
  updateListSelector();
}
function createList(name) {
  if (!name || lists[name]) return;
  lists[name] = [];
  selectList(name);
}
function deleteCurrentList() {
  if (!currentList) return;
  delete lists[currentList];
  currentList = Object.keys(lists)[0] || null;
  saveLists();
  updateListSelector();
  renderItems();
}

// --- Item Management ---
function addItem(item) {
  if (!currentList) return;
  lists[currentList].push(item);
  saveLists();
  renderItems();
}
function clearItems() {
  if (!currentList) return;
  lists[currentList] = [];
  saveLists();
  renderItems();
}
function renderItems() {
  itemList.innerHTML = '';
  if (!currentList || !lists[currentList]) {
    itemCount.textContent = '0 items';
    return;
  }
  const items = lists[currentList];
  itemCount.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
  items.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <div class="item-thumb">
        ${item.image ? `<img src="${item.image}" alt="item" />` : '<span class="no-img">📦</span>'}
      </div>
      <div class="item-info">
        <span class="item-name">${item.name || 'Unnamed'}</span>
        <span class="item-price">${item.price ? '₹' + item.price : ''}</span>
      </div>
      <button class="ghost item-detail" data-idx="${idx}">Details</button>
      <button class="danger item-delete" data-idx="${idx}">Delete</button>
    `;
    itemList.appendChild(li);
  });
}

// --- Modal ---
function showModal(item, idx) {
  modalEditIdx = idx;
  modalImage.src = item.image || '';
  modalImage.style.display = item.image ? '' : 'none';
  modalImage.style.width = '220px';
  modalImage.style.height = '220px';
  modalEditName.value = item.name || '';
  modalEditPrice.value = item.price || '';
  modalEditImage.value = '';
  modalModalImageData = '';
  modalCameraInput.value = '';
  modalCameraPreview.innerHTML = '';
  itemModal.style.display = 'flex';
}
function hideModal() {
  itemModal.style.display = 'none';
}

// --- PDF Export ---
async function exportPDF() {
  if (!currentList || !lists[currentList] || lists[currentList].length === 0) return;
  const items = lists[currentList];
  const doc = new window.jspdf.jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(18);
  doc.text(`List: ${currentList}`, pageWidth / 2, 18, { align: 'center' });

  // Table headers
  const startY = 30;
  let y = startY;
  const rowHeight = 28;
  const colX = [10, 28, 60, 140]; // S.No, Image, Name, Price
  const colW = [16, 28, 76, 40];

  doc.setFontSize(13);
  doc.setFillColor(230, 240, 255);
  doc.rect(colX[0], y, colW[0] + colW[1] + colW[2] + colW[3], rowHeight, 'F');
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.rect(colX[0], y, colW[0], rowHeight);
  doc.rect(colX[1], y, colW[1], rowHeight);
  doc.rect(colX[2], y, colW[2], rowHeight);
  doc.rect(colX[3], y, colW[3], rowHeight);
  doc.text('S.No', colX[0] + 3, y + 18);
  doc.text('Image', colX[1] + 3, y + 18);
  doc.text('Name', colX[2] + 3, y + 18);
  doc.text('Price', colX[3] + 3, y + 18);
  y += rowHeight;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // Draw row borders
    doc.setDrawColor(200, 200, 200);
    doc.rect(colX[0], y, colW[0], rowHeight);
    doc.rect(colX[1], y, colW[1], rowHeight);
    doc.rect(colX[2], y, colW[2], rowHeight);
    doc.rect(colX[3], y, colW[3], rowHeight);
    // S.No
    doc.setFontSize(12);
    doc.text(String(i + 1), colX[0] + 5, y + 18);
    // Image
    if (item.image) {
      try {
        doc.addImage(item.image, 'JPEG', colX[1] + 2, y + 2, 24, 24);
      } catch (e) {
        // If image fails, skip
      }
    }
    // Name
    doc.text(item.name || 'Unnamed', colX[2] + 3, y + 18);
    // Price
    doc.text(item.price ? `Rs. ${item.price}` : '', colX[3] + 3, y + 18);
    y += rowHeight;
    if (y > 270 && i < items.length - 1) {
      doc.addPage();
      y = startY + rowHeight;
    }
  }
  doc.save(`${currentList}.pdf`);
}

// --- Event Listeners ---
newListForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = newListNameInput.value.trim();
  if (name && !lists[name]) {
    createList(name);
    newListNameInput.value = '';
  }
});
listSelector.addEventListener('change', e => {
  selectList(e.target.value);
});
deleteListBtn.addEventListener('click', () => {
  if (currentList && confirm('Delete this list?')) deleteCurrentList();
});
exportPdfBtn.addEventListener('click', exportPDF);
itemForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = itemNameInput.value.trim();
  const price = itemPriceInput.value.trim();
  let image = '';
  // Always prefer camera image if preview is shown
  if (cameraImageData) {
    image = cameraImageData;
    cameraImageData = '';
    cameraInput.value = '';
    cameraPreview.innerHTML = '';
    itemImageInput.value = '';
  } else if (itemImageInput.files && itemImageInput.files[0]) {
    image = await toBase64(itemImageInput.files[0]);
    itemImageInput.value = '';
    cameraInput.value = '';
    cameraPreview.innerHTML = '';
  }
  addItem({ name, price, image });
  itemNameInput.value = '';
  itemPriceInput.value = '';
  // Always clear both inputs and preview after add
  cameraInput.value = '';
  itemImageInput.value = '';
  cameraPreview.innerHTML = '';
  cameraImageData = '';
});

cameraBtn.addEventListener('click', () => {
  cameraInput.click();
});

cameraInput.addEventListener('change', async () => {
  if (cameraInput.files && cameraInput.files[0]) {
    cameraImageData = await toBase64(cameraInput.files[0]);
    // Show preview
    cameraPreview.innerHTML = `<img src="${cameraImageData}" alt="Camera photo preview" style="max-width:120px;max-height:120px;border-radius:8px;box-shadow:0 1px 4px #aaa;display:block;margin-bottom:6px;" />` +
      '<div style="color:#2566d4;font-size:1rem;margin-bottom:4px;">Add name and price for this photo</div>';
  }
});

cameraBtn.addEventListener('click', () => {
  cameraInput.click();
});
clearListBtn.addEventListener('click', () => {
  if (currentList && confirm('Clear all items in this list?')) clearItems();
});
itemList.addEventListener('click', e => {
  if (e.target.classList.contains('item-detail')) {
    const idx = e.target.getAttribute('data-idx');
    showModal(lists[currentList][idx], idx);
  } else if (e.target.classList.contains('item-delete')) {
    const idx = e.target.getAttribute('data-idx');
    lists[currentList].splice(idx, 1);
    saveLists();
    renderItems();
  }
});
closeModalBtn.addEventListener('click', hideModal);
modalCancelBtn.addEventListener('click', hideModal);
window.addEventListener('click', e => {
  if (e.target === itemModal) hideModal();
});

modalUploadBtn.addEventListener('click', (e) => {
  e.preventDefault();
  modalEditImage.value = '';
  modalEditImage.click();
});
modalEditImage.addEventListener('change', async () => {
  if (modalEditImage.files && modalEditImage.files[0]) {
    modalModalImageData = await toBase64(modalEditImage.files[0]);
    modalCameraPreview.innerHTML = `<img src="${modalModalImageData}" alt="Edit photo preview" style="max-width:120px;max-height:120px;border-radius:8px;box-shadow:0 1px 4px #aaa;display:block;margin-bottom:6px;" />`;
  }
});
modalCameraBtn.addEventListener('click', (e) => {
  e.preventDefault();
  modalCameraInput.value = '';
  modalCameraInput.click();
});
modalCameraInput.addEventListener('change', async () => {
  if (modalCameraInput.files && modalCameraInput.files[0]) {
    modalModalImageData = await toBase64(modalCameraInput.files[0]);
    modalCameraPreview.innerHTML = `<img src="${modalModalImageData}" alt="Edit camera preview" style="max-width:120px;max-height:120px;border-radius:8px;box-shadow:0 1px 4px #aaa;display:block;margin-bottom:6px;" />`;
  }
});
modalSaveBtn.addEventListener('click', () => {
  if (modalEditIdx === null || !currentList) return;
  const item = lists[currentList][modalEditIdx];
  item.name = modalEditName.value.trim();
  item.price = modalEditPrice.value.trim();
  if (modalModalImageData) {
    item.image = modalModalImageData;
    modalModalImageData = '';
    modalCameraPreview.innerHTML = '';
  }
  saveLists();
  renderItems();
  hideModal();
});

// --- Helpers ---
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- Init ---
loadLists();
updateListSelector();
renderItems();
