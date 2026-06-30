"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageZoomModalProps {
	isOpen: boolean;
	onClose: () => void;
	src: string;
	alt: string;
}

const ZOOM_STEP = 0.25;

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ isOpen, onClose, src, alt }) => {
	const t = useTranslations("components.Instrument");
	const containerRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const [fitSize, setFitSize] = useState({ width: 0, height: 0 });
	const [zoom, setZoom] = useState(1);
	const [maxZoom, setMaxZoom] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
	const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);

	const clampPosition = useCallback((x: number, y: number, currentZoom: number) => {
		const container = containerRef.current;
		if (!container || fitSize.width === 0) return { x, y };

		const containerRect = container.getBoundingClientRect();
		const displayW = fitSize.width * currentZoom;
		const displayH = fitSize.height * currentZoom;
		const maxX = Math.max(0, (displayW - containerRect.width) / 2);
		const maxY = Math.max(0, (displayH - containerRect.height) / 2);

		return {
			x: Math.max(-maxX, Math.min(maxX, x)),
			y: Math.max(-maxY, Math.min(maxY, y)),
		};
	}, [fitSize]);

	const updateFitSize = useCallback(() => {
		const img = imageRef.current;
		const container = containerRef.current;
		if (!img || !container || img.naturalWidth === 0) return;

		const containerRect = container.getBoundingClientRect();
		const fitScale = Math.min(
			containerRect.width / img.naturalWidth,
			containerRect.height / img.naturalHeight,
			1
		);
		const width = img.naturalWidth * fitScale;
		const height = img.naturalHeight * fitScale;

		setFitSize({ width, height });
		setMaxZoom(fitScale < 1 ? 1 / fitScale : 1);
		setZoom(1);
		setPosition({ x: 0, y: 0 });
	}, []);

	useEffect(() => {
		if (isOpen) {
			document.body.classList.add("focus-mode");
		} else {
			document.body.classList.remove("focus-mode");
		}

		return () => {
			document.body.classList.remove("focus-mode");
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	useEffect(() => {
		if (!isOpen) return;

		const handleResize = () => updateFitSize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [isOpen, updateFitSize]);

	const applyZoom = (nextZoom: number) => {
		const clamped = Math.max(1, Math.min(maxZoom, nextZoom));
		setZoom(clamped);
		setPosition((pos) => clampPosition(pos.x, pos.y, clamped));
	};

	const handlePointerDown = (event: React.PointerEvent) => {
		if (zoom <= 1) return;
		setIsDragging(true);
		dragStart.current = {
			x: event.clientX,
			y: event.clientY,
			posX: position.x,
			posY: position.y,
		};
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	const handlePointerMove = (event: React.PointerEvent) => {
		if (!isDragging) return;
		const dx = event.clientX - dragStart.current.x;
		const dy = event.clientY - dragStart.current.y;
		setPosition(clampPosition(dragStart.current.posX + dx, dragStart.current.posY + dy, zoom));
	};

	const handlePointerUp = (event: React.PointerEvent) => {
		setIsDragging(false);
		event.currentTarget.releasePointerCapture(event.pointerId);
	};

	const handleWheel = (event: React.WheelEvent) => {
		event.preventDefault();
		const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
		applyZoom(zoom + delta);
	};

	const getTouchDistance = (touches: React.TouchList) => {
		const [a, b] = [touches[0], touches[1]];
		const dx = a.clientX - b.clientX;
		const dy = a.clientY - b.clientY;
		return Math.hypot(dx, dy);
	};

	const handleTouchStart = (event: React.TouchEvent) => {
		if (event.touches.length === 2) {
			pinchStart.current = { distance: getTouchDistance(event.touches), zoom };
		}
	};

	const handleTouchMove = (event: React.TouchEvent) => {
		if (event.touches.length !== 2 || !pinchStart.current) return;
		event.preventDefault();
		const distance = getTouchDistance(event.touches);
		const scale = distance / pinchStart.current.distance;
		applyZoom(pinchStart.current.zoom * scale);
	};

	const handleTouchEnd = () => {
		pinchStart.current = null;
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-20 flex flex-col bg-black/90">
			<div className="flex items-center justify-end gap-2 p-4 shrink-0">
				<button
					type="button"
					className="p-2 text-we-300 hover:text-we-50 transition-colors disabled:opacity-40"
					onClick={() => applyZoom(zoom - ZOOM_STEP)}
					disabled={zoom <= 1}
					aria-label={t("zoom_out")}
				>
					<ZoomOut className="w-5 h-5" />
				</button>
				<button
					type="button"
					className="p-2 text-we-300 hover:text-we-50 transition-colors disabled:opacity-40"
					onClick={() => applyZoom(zoom + ZOOM_STEP)}
					disabled={zoom >= maxZoom}
					aria-label={t("zoom_in")}
				>
					<ZoomIn className="w-5 h-5" />
				</button>
				<button
					type="button"
					className="p-2 text-we-300 hover:text-we-50 transition-colors disabled:opacity-40"
					onClick={() => {
						setZoom(1);
						setPosition({ x: 0, y: 0 });
					}}
					disabled={zoom <= 1 && position.x === 0 && position.y === 0}
					aria-label={t("reset_zoom")}
				>
					<RotateCcw className="w-5 h-5" />
				</button>
				<button
					type="button"
					className="px-3 py-1.5 text-sm bg-transparent text-we-300 border-[0.1rem] border-we-500 rounded-button hover:text-we-50 transition-colors"
					onClick={onClose}
				>
					{t("close")}
				</button>
			</div>

			<div
				ref={containerRef}
				className={`flex-1 overflow-hidden flex items-center justify-center touch-none ${
					zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
				}`}
				onWheel={handleWheel}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onClick={(event) => {
					if (event.target === event.currentTarget) onClose();
				}}
			>
				<div
					style={{
						transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
						transition: isDragging ? "none" : "transform 0.1s ease-out",
					}}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						ref={imageRef}
						src={src}
						alt={alt}
						draggable={false}
						onLoad={updateFitSize}
						style={{
							width: fitSize.width || "auto",
							height: fitSize.height || "auto",
							maxWidth: "none",
							maxHeight: "none",
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default ImageZoomModal;
