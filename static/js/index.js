$(document).ready(function() {
  const options = {
    slidesToScroll: 1,
    slidesToShow: 1,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  }
  // Initialize all div with carousel class
  const carousels = bulmaCarousel.attach('.carousel', options);
})

document.addEventListener('DOMContentLoaded', function() {
  loadTableData();
  setupEventListeners();
  window.addEventListener('resize', adjustNameColumnWidth);
});

async function loadModelData() {
  let modelData = []
  try {
    const response = await fetch(`./data/data.json`);
    if (response.ok) {
      modelData = await response.json();
      console.log(modelData)
    }
  } catch (e) {
    console.error('Failed to load model data:', e);
  }

  return modelData;
}

// Helper function to get model directories
// You'll need to implement this based on your setup
async function getModelDirectories() {
  // Option 1: Use a model list file (recommended)
  try {
    const response = await fetch('./data/model_list.json');
    if (response.ok) {
      const modelList = await response.json();
      return modelList || [];
    }
  } catch (e) {
    console.warn('Could not load model_list.json, falling back to hardcoded list');
    return [];
  }
}

async function loadTableData() {
  try {
    const data = await loadModelData();
    console.log('Data loaded successfully:', data);

    const tbody = document.querySelector('#MMMG-table tbody');
    tbody.innerHTML = ''; // Clear existing content

    // Prepare data for styling
    const iScores = prepareScoresForStyling(data, 'i');
    const itScores = prepareScoresForStyling(data, 'it');
    const aScores = prepareScoresForStyling(data, 'a');
    const atScores = prepareScoresForStyling(data, 'at');

    data.forEach((row, index) => {
      const tr = document.createElement('tr');
      tr.classList.add(row.info.type);

      // Add data attributes to indicate which categories this model has data for
      if (row.i) tr.setAttribute('data-has-i', 'true');
      if (row.it) tr.setAttribute('data-has-it', 'true');
      if (row.a) tr.setAttribute('data-has-a', 'true');
      if (row.at) tr.setAttribute('data-has-at', 'true');

      const nameCell = row.info.link && row.info.link.trim() !== '' ?
        `<a href="${row.info.link}" target="_blank"><b>${row.info.name}</b></a>` :
        `<b>${row.info.name}</b>`;

      const safeGet = (obj, path, defaultValue = '-') => {
        if (!obj) return defaultValue;
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
      };

      // Helper function to format the overall value
      const formatValue = (value, shouldAddAsterisk = false) => {
        if (value !== '-' && value !== null && value !== undefined) {
          const formattedValue = value.toFixed(3);
          return shouldAddAsterisk ? formattedValue + '*' : formattedValue;
        }
        return '-';
      };

      // Check if this model's results are provided by authors
      const isAuthorProvided = !row.info.source || row.info.source === 'author';

      tr.innerHTML = `
        <td>${nameCell}</td>
        <td>${row.info.size || '-'}</td>
        <td>${row.info.date || '-'}</td>
        <td class="hidden i-details">${row.i ? applyStyle(formatValue(safeGet(row, 'i.overall'), isAuthorProvided), iScores.overall[index]) : '-'}</td>
        <td class="hidden i-details">${row.i ? applyStyle(formatValue(safeGet(row, 'i.object'), isAuthorProvided), iScores.object[index]) : '-'}</td>
        <td class="hidden i-details">${row.i ? applyStyle(formatValue(safeGet(row, 'i.relation'), isAuthorProvided), iScores.relation[index]) : '-'}</td>
        <td class="hidden i-details">${row.i ? applyStyle(formatValue(safeGet(row, 'i.format'), isAuthorProvided), iScores.format[index]) : '-'}</td>
        <td class="hidden i-details">${row.i ? applyStyle(formatValue(safeGet(row, 'i.text rendering'), isAuthorProvided), iScores.textRendering[index]) : '-'}</td>
        <td class="hidden it-details">${row.it ? applyStyle(formatValue(safeGet(row, 'it.overall'), isAuthorProvided), itScores.overall[index]) : '-'}</td>
        <td class="hidden it-details">${row.it ? applyStyle(formatValue(safeGet(row, 'it.consistency'), isAuthorProvided), itScores.consistency[index]) : '-'}</td>
        <td class="hidden it-details">${row.it ? applyStyle(formatValue(safeGet(row, 'it.coherence'), isAuthorProvided), itScores.coherence[index]) : '-'}</td>
        <td class="hidden it-details">${row.it ? applyStyle(formatValue(safeGet(row, 'it.editing'), isAuthorProvided), itScores.editing[index]) : '-'}</td>
        <td class="hidden it-details">${row.it ? applyStyle(formatValue(safeGet(row, 'it.reasoning'), isAuthorProvided), itScores.reasoning[index]) : '-'}</td>
        <td class="hidden a-details">${row.a ? applyStyle(formatValue(safeGet(row, 'a.overall'), isAuthorProvided), aScores.overall[index]) : '-'}</td>
        <td class="hidden a-details">${row.a ? applyStyle(formatValue(safeGet(row, 'a.sound'), isAuthorProvided), aScores.sound[index]) : '-'}</td>
        <td class="hidden a-details">${row.a ? applyStyle(formatValue(safeGet(row, 'a.music'), isAuthorProvided), aScores.music[index]) : '-'}</td>
        <td class="hidden at-details">${row.at ? applyStyle(formatValue(safeGet(row, 'at.overall'), isAuthorProvided), atScores.overall[index]) : '-'}</td>
        <td class="hidden at-details">${row.at ? applyStyle(formatValue(safeGet(row, 'at.voice'), isAuthorProvided), atScores.voice[index]) : '-'}</td>
        <td class="hidden at-details">${row.at ? applyStyle(formatValue(safeGet(row, 'at.transcript'), isAuthorProvided), atScores.transcript[index]) : '-'}</td>
        <td class="hidden at-details">${row.at ? applyStyle(formatValue(safeGet(row, 'at.coherence'), isAuthorProvided), atScores.coherence[index]) : '-'}</td>
      `;
      tbody.appendChild(tr);
    });

    // Initialize the table with correct colspan values and default to Image category
    setTimeout(() => {
      // Initially all sections show only overall, so each header spans 1 column
      document.querySelector('.i-details-cell').setAttribute('colspan', '1');
      document.querySelector('.it-details-cell').setAttribute('colspan', '1');
      document.querySelector('.a-details-cell').setAttribute('colspan', '1');
      document.querySelector('.at-details-cell').setAttribute('colspan', '1');

      adjustNameColumnWidth();

      // Default to Image category expanded
      toggleDetails('i');
    }, 0);
  } catch (error) {
    console.error('Error loading table data:', error);
    document.querySelector('#MMMG-table tbody').innerHTML = `
      <tr>
          <td colspan="20"> Error loading data: ${error.message}<br> Please ensure the data directory and files exist. </td>
      </tr>
    `;
  }
}

function setupEventListeners() {
  // Updated event listeners for new categories
  document.querySelector('.i-details-cell').addEventListener('click', function() {
    toggleDetails('i');
  });
  document.querySelector('.it-details-cell').addEventListener('click', function() {
    toggleDetails('it');
  });
  document.querySelector('.a-details-cell').addEventListener('click', function() {
    toggleDetails('a');
  });
  document.querySelector('.at-details-cell').addEventListener('click', function() {
    toggleDetails('at');
  });

  var headers = document.querySelectorAll('#MMMG-table thead tr:last-child th.sortable');
  headers.forEach(function(header) {
    header.addEventListener('click', function() {
      sortTable(this);
    });
  });
}

function toggleDetails(section) {
  var sections = ['i', 'it', 'a', 'at'];

  // First, hide all sections and reset colspan
  sections.forEach(function(sec) {
    var detailCells = document.querySelectorAll('.' + sec + '-details');
    var headerCell = document.querySelector('.' + sec + '-details-cell');

    detailCells.forEach(cell => {
      cell.classList.add('hidden');
      // Reset colspan for overall cells
      if (cell.classList.contains(sec + '-overall-cell')) {
        cell.setAttribute('colspan', '1');
      }
    });

    // Remove active styling from all headers
    headerCell.classList.remove('active-category');
  });

  // Show the selected section
  var detailCells = document.querySelectorAll('.' + section + '-details');
  var activeHeaderCell = document.querySelector('.' + section + '-details-cell');

  detailCells.forEach(cell => cell.classList.remove('hidden'));

  // Add active styling to the current header
  activeHeaderCell.classList.add('active-category');

  // Show/hide model rows based on whether they have data for the selected section
  var allRows = document.querySelectorAll('#MMMG-table tbody tr');
  allRows.forEach(function(row) {
    var hasData = row.getAttribute('data-has-' + section) === 'true';
    if (hasData) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });

  // Show/hide model rows based on whether they have data for the selected section
  var allRows = document.querySelectorAll('#MMMG-table tbody tr');
  allRows.forEach(function(row) {
    var hasData = row.getAttribute('data-has-' + section) === 'true';
    if (hasData) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });

  // Adjust header colspans and overall cell colspans based on expanded section
  sections.forEach(function(sec) {
    var headerCell = document.querySelector('.' + sec + '-details-cell');
    if (sec === section) {
      if (section === 'i' || section === 'it'){
        headerCell.setAttribute('colspan', '5');
      }
      else if (section === 'a'){
        headerCell.setAttribute('colspan', '3');
      }
      else {
        headerCell.setAttribute('colspan', '4');
      }

    } else {
      headerCell.setAttribute('colspan', '1'); // Other headers take 1 column each
    }
  });

  // Auto-sort by the expanded section's overall column (first column of the section)
  setTimeout(() => {
    var overallHeader = document.querySelector('#MMMG-table thead tr:last-child th.' + section + '-details.sortable');
    if (overallHeader) {
      sortTable(overallHeader, true); // true for descending order
    }
    adjustNameColumnWidth();
  }, 10);
}

function resetTable() {
  // Reset to default state: Image category expanded
  // First show all rows, then toggle to Image which will hide rows without Image data
  var allRows = document.querySelectorAll('#MMMG-table tbody tr');
  allRows.forEach(function(row) {
    row.style.display = '';
  });

  toggleDetails('i');
}

function sortTable(header, forceDescending = false, maintainOrder = false) {
  var table = document.getElementById('MMMG-table');
  var tbody = table.querySelector('tbody');
  var allRows = Array.from(tbody.querySelectorAll('tr'));
  var visibleRows = allRows.filter(row => row.style.display !== 'none');
  var hiddenRows = allRows.filter(row => row.style.display === 'none');

  var headers = Array.from(header.parentNode.children);
  var columnIndex = headers.indexOf(header);
  var sortType = header.dataset.sort;

  var isDescending = forceDescending || (!header.classList.contains('asc') && !header.classList.contains('desc')) || header.classList.contains('asc');

  if (!maintainOrder) {
    visibleRows.sort(function(a, b) {
      var aValue = getCellValue(a, columnIndex);
      var bValue = getCellValue(b, columnIndex);

      if (aValue === '-' && bValue !== '-') return isDescending ? 1 : -1;
      if (bValue === '-' && aValue !== '-') return isDescending ? -1 : 1;

      if (sortType === 'number') {
        return isDescending ? parseFloat(bValue) - parseFloat(aValue) : parseFloat(aValue) - parseFloat(bValue);
      } else if (sortType === 'date') {
        return isDescending ? new Date(bValue) - new Date(aValue) : new Date(aValue) - new Date(bValue);
      } else {
        return isDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
    });
  }

  headers.forEach(function(th) {
    th.classList.remove('asc', 'desc');
  });

  header.classList.add(isDescending ? 'desc' : 'asc');

  // Clear tbody and re-append sorted visible rows first, then hidden rows
  tbody.innerHTML = '';
  visibleRows.forEach(function(row) {
    tbody.appendChild(row);
  });
  hiddenRows.forEach(function(row) {
    tbody.appendChild(row);
  });

  setTimeout(adjustNameColumnWidth, 0);
}

function getCellValue(row, index) {
  var cells = Array.from(row.children);
  var cell = cells[index];

  if (cell && cell.classList.contains('hidden')) {
    // Find the first visible cell in any category
    cell = cells.find(c => !c.classList.contains('hidden') &&
                          (c.classList.contains('i-details') ||
                           c.classList.contains('it-details') ||
                           c.classList.contains('a-details') ||
                           c.classList.contains('at-details')));
  }
  return cell ? cell.textContent.trim() : '';
}

function adjustNameColumnWidth() {
  const nameColumn = document.querySelectorAll('#MMMG-table td:first-child, #MMMG-table th:first-child');
  let maxWidth = 0;

  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'nowrap';
  document.body.appendChild(span);

  nameColumn.forEach(cell => {
    span.textContent = cell.textContent;
    const width = span.offsetWidth;
    if (width > maxWidth) {
      maxWidth = width;
    }
  });

  document.body.removeChild(span);

  maxWidth += 20; // Increased padding

  nameColumn.forEach(cell => {
    cell.style.width = `${maxWidth}px`;
    cell.style.minWidth = `${maxWidth}px`; // Added minWidth
    cell.style.maxWidth = `${maxWidth}px`;
  });
}

function prepareScoresForStyling(data, section) {
  const scores = {};
  const fields = {
    'i': ['overall', 'object', 'relation', 'format', 'textRendering'],
    'it': ['overall', 'consistency', 'coherence', 'editing', 'reasoning'],
    'a': ['overall', 'sound', 'music'],
    'at': ['overall', 'voice', 'transcript', 'coherence']
  };

  const sectionFields = fields[section] || [];

  sectionFields.forEach(field => {
    // Only consider data from models that have data for this section
    const values = data.map((row, index) => {
        if (!row[section]) return { value: null, index };
        // Map internal field names to JSON keys
        let fieldKey = field;
        switch(field) {
          case 'textRendering':
            fieldKey = 'text rendering';
            break;
          // For other fields, use the field name as is
        }
        return { value: row[section][fieldKey], index };
      })
      .filter(item => item.value !== null && item.value !== undefined && item.value !== '-')
      .map(item => ({ ...item, value: parseFloat(item.value) }));

    if (values.length > 0) {
      const sortedValues = [...new Set(values.map(item => item.value))].sort((a, b) => b - a);
      scores[field] = data.map((row, index) => {
        if (!row[section]) return -1;
        // Map internal field names to JSON keys
        let fieldKey = field;
        switch(field) {
          case 'textRendering':
            fieldKey = 'text rendering';
            break;
        }
        const value = row[section][fieldKey];
        if (value === null || value === undefined || value === '-') {
          return -1;
        }
        return sortedValues.indexOf(parseFloat(value));
      });
    } else {
      scores[field] = data.map(() => -1);
    }
  });

  return scores;
}

function applyStyle(value, rank) {
  if (value === undefined || value === null || value === '-') return '-';
  if (rank === 0) return `<b>${value}</b>`;
  if (rank === 1) return `<span style="text-decoration: underline;">${value}</span>`;
  return value;
}