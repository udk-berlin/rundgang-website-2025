type IntersectionCallback = (entry: IntersectionObserverEntry) => void;

class IntersectionObserverManager {
	private observer: IntersectionObserver | null = null;
	private elements = new Map<Element, IntersectionCallback>();

	private createObserver() {
		if (this.observer) return;

		this.observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const callback = this.elements.get(entry.target);
					if (callback) {
						callback(entry);
					}
				});
			},
			{
				threshold: Array.from({ length: 100 }, (_, i) => i / 100),
				rootMargin: '10px 0px'
			}
		);
	}

	private destroyObserver() {
		if (this.observer && this.elements.size === 0) {
			this.observer.disconnect();
			this.observer = null;
		}
	}

	registerElement(element: Element, callback: IntersectionCallback) {
		this.createObserver();
		this.elements.set(element, callback);
		this.observer?.observe(element);
	}

	unregisterElement(element: Element) {
		this.observer?.unobserve(element);
		this.elements.delete(element);
		this.destroyObserver();
	}
}

// Singleton instance
const intersectionManager = new IntersectionObserverManager();

export { intersectionManager };
