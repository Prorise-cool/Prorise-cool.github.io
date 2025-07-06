document.addEventListener('DOMContentLoaded', () => {
    const chapters = [
        { title: '第一章：Java语言核心', file: 'chapter_1.md' },
        { title: '第二章：面向对象编程（OOP）', file: 'chapter_2.md' },
        { title: '第三章：Java核心API', file: 'chapter_3.md' },
        { title: '第四章：高级特性', file: 'chapter_4.md' },
        { title: '第五章：并发编程', file: 'chapter_5.md' },
        { title: '第六章：IO流', file: 'chapter_6.md' },
        { title: '第七章：Java 8及以上新特性', file: 'chapter_7.md' },
        { title: '第八章：开发规范与设计模式', file: 'chapter_8.md' },
    ];

    const navLinksContainer = document.getElementById('nav-links');
    const mainContentContainer = document.getElementById('main-content');
    const sections = [];

    const loadChapter = async (chapter, index) => {
        const chapterId = `chapter-${index + 1}`;
        

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${chapterId}`;
        a.textContent = chapter.title;
        a.className = 'block py-2 px-4 rounded-md text-gray-600';
        li.appendChild(a);
        navLinksContainer.appendChild(li);


        const section = document.createElement('section');
        section.id = chapterId;
        section.className = 'prose prose-indigo lg:prose-lg xl:prose-xl';
        mainContentContainer.appendChild(section);
        sections.push(section);

        try {
            const response = await fetch(`content/${chapter.file}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${chapter.file}: ${response.statusText}`);
            }
            const markdown = await response.text();
            section.innerHTML = marked.parse(markdown);
        } catch (error) {
            section.innerHTML = `<p class="text-red-500">Error loading chapter: ${error.message}</p>`;
        }
    };
    
    const init = async () => {
        await Promise.all(chapters.map(loadChapter));
        Prism.highlightAll();
        setupSmoothScrolling();
        setupScrollSpy();
    };

    const setupSmoothScrolling = () => {
        navLinksContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const targetId = e.target.getAttribute('href');
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    };

    const setupScrollSpy = () => {
        const navLinks = navLinksContainer.querySelectorAll('a');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href').slice(1) === entry.target.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => observer.observe(section));
    };

    init();
});
