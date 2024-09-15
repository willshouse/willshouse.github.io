// modal.js

const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementById('close-modal');

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    modalBody.innerHTML = '';
});

window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
        modalBody.innerHTML = '';
    }
});

document.getElementById('tts-link').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('tts');
});

document.getElementById('patreon-link').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('patreon');
});

document.getElementById('discord-link').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('discord');
});

function openModal(type) {
    modal.style.display = 'block';

    let contentHTML = '';

    if (type === 'tts') {
        contentHTML = `
            <h2>TTS Donation</h2>
            <p>You can support us via TTS donations on Streamlabs.</p>
            <a href="https://streamlabs.com/willsmusichouse8515/tip" target="_blank">Go to Streamlabs</a>
        `;
    } else if (type === 'patreon') {
        contentHTML = `
            <h2>Support us on Patreon</h2>
            <p>Become a patron to access exclusive content.</p>
            <a href="https://www.patreon.com/willsmusichouse" target="_blank">Go to Patreon</a>
        `;
    } else if (type === 'discord') {
        contentHTML = `
            <h2>Join our Discord Server</h2>
            <p>Connect with us and the community on Discord. You can join the show live via voice channels!</p>
            <a href="https://discord.gg/9UrtGqkK22" target="_blank">Join Discord</a>
        `;
    }

    modalBody.innerHTML = contentHTML;
}
