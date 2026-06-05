const storageKey = 'association-manager-state';
const currencySettingKey = 'association-manager-currency';
const currencyCode = loadCurrencyCode();

const state = loadState();

const memberForm = document.getElementById('member-form');
const memberNameInput = document.getElementById('member-name');
const memberAddressInput = document.getElementById('member-address');
const memberList = document.getElementById('member-list');

const contributionForm = document.getElementById('contribution-form');
const contributionMemberInput = document.getElementById('contribution-member');
const contributionAmountInput = document.getElementById('contribution-amount');
const contributionDateInput = document.getElementById('contribution-date');
const contributionList = document.getElementById('contribution-list');

const meetingForm = document.getElementById('meeting-form');
const meetingTitleInput = document.getElementById('meeting-title');
const meetingDateTimeInput = document.getElementById('meeting-datetime');
const meetingAgendaInput = document.getElementById('meeting-agenda');
const meetingList = document.getElementById('meeting-list');

const alertForm = document.getElementById('alert-form');
const alertMeetingSelect = document.getElementById('alert-meeting');
const alertMessageInput = document.getElementById('alert-message');
const alertList = document.getElementById('alert-list');

const minutesForm = document.getElementById('minutes-form');
const minutesMeetingSelect = document.getElementById('minutes-meeting');
const minutesContentInput = document.getElementById('minutes-content');
const minutesList = document.getElementById('minutes-list');

memberForm.addEventListener('submit', (event) => {
  event.preventDefault();

  state.members.push({
    id: crypto.randomUUID(),
    name: memberNameInput.value.trim(),
    address: memberAddressInput.value.trim(),
  });

  memberForm.reset();
  saveAndRender();
});

contributionForm.addEventListener('submit', (event) => {
  event.preventDefault();

  state.contributions.push({
    id: crypto.randomUUID(),
    memberName: contributionMemberInput.value.trim(),
    amount: Number(contributionAmountInput.value),
    date: contributionDateInput.value,
  });

  contributionForm.reset();
  saveAndRender();
});

meetingForm.addEventListener('submit', (event) => {
  event.preventDefault();

  state.meetings.push({
    id: crypto.randomUUID(),
    title: meetingTitleInput.value.trim(),
    dateTime: meetingDateTimeInput.value,
    agenda: meetingAgendaInput.value.trim(),
  });

  meetingForm.reset();
  saveAndRender();
});

alertForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const meetingId = alertMeetingSelect.value;
  const meeting = state.meetings.find((item) => item.id === meetingId);
  if (!meeting) {
    return;
  }

  state.alerts.push({
    id: crypto.randomUUID(),
    meetingId,
    meetingTitle: meeting.title,
    message: alertMessageInput.value.trim(),
    createdAt: new Date().toISOString(),
  });

  alertForm.reset();
  saveAndRender();
});

minutesForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const meetingId = minutesMeetingSelect.value;
  const meeting = state.meetings.find((item) => item.id === meetingId);
  if (!meeting) {
    return;
  }

  state.minutes.push({
    id: crypto.randomUUID(),
    meetingId,
    meetingTitle: meeting.title,
    content: minutesContentInput.value.trim(),
    publishedAt: new Date().toISOString(),
  });

  minutesForm.reset();
  saveAndRender();
});

function loadState() {
  const persisted = localStorage.getItem(storageKey);
  if (!persisted) {
    return {
      members: [],
      contributions: [],
      meetings: [],
      alerts: [],
      minutes: [],
    };
  }

  try {
    const parsed = JSON.parse(persisted);
    return {
      members: Array.isArray(parsed.members) ? parsed.members : [],
      contributions: Array.isArray(parsed.contributions) ? parsed.contributions : [],
      meetings: Array.isArray(parsed.meetings) ? parsed.meetings : [],
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
      minutes: Array.isArray(parsed.minutes) ? parsed.minutes : [],
    };
  } catch {
    return {
      members: [],
      contributions: [],
      meetings: [],
      alerts: [],
      minutes: [],
    };
  }
}

function saveAndRender() {
  localStorage.setItem(storageKey, JSON.stringify(state));
  render();
}

function render() {
  renderMembers();
  renderContributions();
  renderMeetings();
  renderMeetingOptions();
  renderAlerts();
  renderMinutes();
}

function renderMembers() {
  memberList.textContent = '';
  state.members.forEach((member) => {
    const item = document.createElement('li');
    item.textContent = `${member.name} — ${member.address}`;
    memberList.appendChild(item);
  });
}

function renderContributions() {
  contributionList.textContent = '';
  state.contributions.forEach((contribution) => {
    const item = document.createElement('li');
    item.textContent = `${contribution.memberName} contributed ${formatCurrency(contribution.amount)} on ${formatDate(contribution.date)}`;
    contributionList.appendChild(item);
  });
}

function renderMeetings() {
  meetingList.textContent = '';
  state.meetings.forEach((meeting) => {
    const item = document.createElement('li');
    item.textContent = `${meeting.title} on ${formatDateTime(meeting.dateTime)} — Agenda: ${meeting.agenda}`;
    meetingList.appendChild(item);
  });
}

function renderMeetingOptions() {
  const defaultAlertOption = document.createElement('option');
  defaultAlertOption.value = '';
  defaultAlertOption.textContent = 'Choose a meeting';

  alertMeetingSelect.textContent = '';
  alertMeetingSelect.appendChild(defaultAlertOption);

  const defaultMinutesOption = document.createElement('option');
  defaultMinutesOption.value = '';
  defaultMinutesOption.textContent = 'Choose a meeting';

  minutesMeetingSelect.textContent = '';
  minutesMeetingSelect.appendChild(defaultMinutesOption);

  state.meetings.forEach((meeting) => {
    const alertOption = document.createElement('option');
    alertOption.value = meeting.id;
    alertOption.textContent = `${meeting.title} (${formatDateTime(meeting.dateTime)})`;
    alertMeetingSelect.appendChild(alertOption);

    const minutesOption = document.createElement('option');
    minutesOption.value = meeting.id;
    minutesOption.textContent = `${meeting.title} (${formatDateTime(meeting.dateTime)})`;
    minutesMeetingSelect.appendChild(minutesOption);
  });
}

function renderAlerts() {
  alertList.textContent = '';
  state.alerts.forEach((alert) => {
    const item = document.createElement('li');
    item.textContent = `[${formatDateTime(alert.createdAt)}] Alert for ${alert.meetingTitle}: ${alert.message}`;
    alertList.appendChild(item);
  });
}

function renderMinutes() {
  minutesList.textContent = '';
  state.minutes.forEach((minutes) => {
    const item = document.createElement('li');
    item.textContent = `[${formatDateTime(minutes.publishedAt)}] ${minutes.meetingTitle}: ${minutes.content}`;
    minutesList.appendChild(item);
  });
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(year, month - 1, day).toLocaleDateString();
}

function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

function loadCurrencyCode() {
  const persisted = localStorage.getItem(currencySettingKey);
  if (typeof persisted === 'string' && /^[A-Z]{3}$/.test(persisted)) {
    return persisted;
  }

  return 'USD';
}

render();
